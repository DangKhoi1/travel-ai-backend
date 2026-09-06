import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { EmbeddingService } from './embedding.service';
import { TravelPlace } from '../travelplace/entities/travelplace.entity';
import { VectorData } from './entities/vector-data.entity';
import { CreateTravelplaceDto } from '../travelplace/dto/create-travelplace.dto';
import { randomUUID } from 'crypto';
import { ChatService } from '../chat/chat.service';
import { ChatHistory } from '../chat/entities/chat-history.entity';
import { CacheService } from '../../common/cache/cache.service';

export interface RetrievedDoc {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  bestSeason: string;
  category: string;
  similarity: number;
}

export interface ChatResponse {
  EC: number;
  EM: string;
  data: {
    answer: string;
    sources: RetrievedDoc[];
    query: string;
    sessionId: string;
  } | null;
}

export interface GeneratedStop {
  placeId: string;
  dayNumber: number;
  estimatedDuration: string;
}

export type ChatStreamEvent =
  | { type: 'meta'; sessionId: string; sources: RetrievedDoc[] }
  | { type: 'chunk'; content: string }
  | { type: 'done' };

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private openai: OpenAI;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(TravelPlace)
    private travelplaceRepo: Repository<TravelPlace>,
    @InjectRepository(VectorData)
    private vectorDataRepo: Repository<VectorData>,
    private embeddingService: EmbeddingService,
    private configService: ConfigService,
    private chatService: ChatService,
    private cacheService: CacheService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async indexPlace(
    dto: CreateTravelplaceDto,
  ): Promise<{ EC: number; EM: string; data: Partial<TravelPlace> | null }> {
    try {
      // 1. Tạo địa điểm trong bảng travel_places
      const place = this.travelplaceRepo.create(dto);
      await this.travelplaceRepo.save(place);

      // 2. Tạo embedding và lưu vào bảng vector_data
      const textToEmbed = this.embeddingService.buildIndexText(dto);
      this.logger.log(
        `Indexing: "${dto.name}" | Text: ${textToEmbed.substring(0, 80)}...`,
      );

      const embedding = await this.embeddingService.embed(textToEmbed);
      const vectorStr = this.embeddingService.toVectorString(embedding);

      await this.dataSource.query(
        `INSERT INTO vector_data (id, "placeId", embedding, "modelName", "createdAt")
         VALUES (gen_random_uuid(), $1, $2::vector, $3, NOW())`,
        [place.id, vectorStr, EmbeddingService.MODEL],
      );

      return {
        EC: 0,
        EM: `Đã thêm "${dto.name}" vào knowledge base`,
        data: { id: place.id, name: place.name, city: place.city },
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Index failed: ${msg}`);
      return { EC: 1, EM: msg, data: null };
    }
  }

  async retrieve(query: string, topK = 3): Promise<RetrievedDoc[]> {
    const cacheKey = `rag:${topK}:${query.trim().toLowerCase()}`;
    const cached = await this.cacheService.get<RetrievedDoc[]>(cacheKey);
    if (cached) return cached;
    const queryEmbedding = await this.embeddingService.embed(query);
    const vectorStr = this.embeddingService.toVectorString(queryEmbedding);

    const results: RetrievedDoc[] = await this.dataSource.query(
      `SELECT
        tp.id, tp.name, tp.description, tp.city, tp.country,
        tp."bestSeason", tp.category,
        1 - (vd.embedding <=> $1::vector) AS similarity
       FROM vector_data vd
       JOIN travel_places tp ON tp.id = vd."placeId"
       WHERE vd.embedding IS NOT NULL
       ORDER BY vd.embedding <=> $1::vector
       LIMIT $2`,
      [vectorStr, topK],
    );

    await this.cacheService.set(cacheKey, results, 300);
    return results;
  }

  async chat(
    userId: string,
    message: string,
    requestedSessionId?: string,
    topK = 3,
  ): Promise<ChatResponse> {
    try {
      const sessionId = requestedSessionId || randomUUID();
      const history = await this.chatService.getSession(userId, sessionId, 8);
      const docs = await this.retrieve(message, topK);

      if (docs.length === 0) {
        const fallbackAnswer = await this.generate(message, [], history);
        await this.chatService.save(userId, sessionId, message, fallbackAnswer);
        return {
          EC: 0,
          EM: 'Answered without context (knowledge base empty)',
          data: {
            answer: fallbackAnswer,
            sources: [],
            query: message,
            sessionId,
          },
        };
      }

      const answer = await this.generate(message, docs, history);
      await this.chatService.save(userId, sessionId, message, answer);

      return {
        EC: 0,
        EM: 'Success',
        data: {
          answer,
          sources: docs,
          query: message,
          sessionId,
        },
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Chat failed: ${msg}`);
      return { EC: 1, EM: msg, data: null };
    }
  }

  async *streamChat(
    userId: string,
    message: string,
    requestedSessionId?: string,
    topK = 3,
  ): AsyncGenerator<ChatStreamEvent> {
    const sessionId = requestedSessionId || randomUUID();
    const [docs, history] = await Promise.all([
      this.retrieve(message, topK),
      this.chatService.getSession(userId, sessionId, 8),
    ]);
    yield { type: 'meta', sessionId, sources: docs };
    const context = docs
      .map(
        (doc) => `${doc.name} (${doc.city || doc.country}): ${doc.description}`,
      )
      .join('\n');
    const stream = await this.openai.chat.completions.create({
      model: this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
      stream: true,
      temperature: 0.7,
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content: `Bạn là trợ lý du lịch Việt Nam. Trả lời tự nhiên bằng tiếng Việt, chỉ dựa trên dữ liệu tham khảo; nếu thiếu hãy nói rõ.\nDữ liệu tham khảo:\n${context || 'Chưa có dữ liệu địa điểm phù hợp.'}`,
        },
        ...history.flatMap((entry) => [
          { role: 'user' as const, content: entry.message },
          { role: 'assistant' as const, content: entry.response },
        ]),
        { role: 'user', content: message },
      ],
    });
    let answer = '';
    for await (const part of stream) {
      const content = part.choices[0]?.delta?.content;
      if (content) {
        answer += content;
        yield { type: 'chunk', content };
      }
    }
    await this.chatService.save(userId, sessionId, message, answer);
    yield { type: 'done' };
  }

  private async generate(
    query: string,
    docs: RetrievedDoc[],
    history: ChatHistory[] = [],
  ): Promise<string> {
    const contextBlock =
      docs.length > 0
        ? docs
            .map(
              (d, i) =>
                `[Nguồn ${i + 1}] ${d.name}
  - Thành phố: ${d.city ?? 'Không rõ'}
  - Quốc gia: ${d.country ?? 'Việt Nam'}
  - Mùa tốt nhất: ${d.bestSeason ?? 'Quanh năm'}
  - Loại hình: ${d.category ?? 'Tổng hợp'}
  - Mô tả: ${d.description}`,
            )
            .join('\n\n')
        : 'Không có thông tin cụ thể trong cơ sở dữ liệu.';

    const systemPrompt = `Bạn là trợ lý du lịch Việt Nam thông minh và thân thiện.

NHIỆM VỤ:
Dựa vào thông tin dưới đây để trả lời câu hỏi của khách du lịch một cách chính xác, tự nhiên và hữu ích.

THÔNG TIN THAM KHẢO:
${contextBlock}

NGUYÊN TẮC TRẢ LỜI:
- Chỉ sử dụng thông tin trong phần "THÔNG TIN THAM KHẢO" ở trên
- Nếu không đủ thông tin, hãy nói thật và đưa ra gợi ý chung
- Trả lời bằng tiếng Việt, tự nhiên như người bản địa
- Có thể gợi ý thêm mẹo du lịch thực tế nếu phù hợp
- Độ dài câu trả lời: vừa đủ, không quá ngắn hay quá dài`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.flatMap((entry) => [
          { role: 'user' as const, content: entry.message },
          { role: 'assistant' as const, content: entry.response },
        ]),
        { role: 'user', content: query },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return (
      response.choices[0].message.content ??
      'Xin lỗi, tôi không thể trả lời lúc này.'
    );
  }

  async reindexPlace(id: string): Promise<{ EC: number; EM: string }> {
    const place = await this.travelplaceRepo.findOneBy({ id });
    if (!place) return { EC: 1, EM: 'Place not found' };

    const textToEmbed = this.embeddingService.buildIndexText(place);
    const embedding = await this.embeddingService.embed(textToEmbed);
    const vectorStr = this.embeddingService.toVectorString(embedding);

    // Upsert: update nếu đã có, insert nếu chưa
    const existing = await this.vectorDataRepo.findOneBy({ placeId: id });
    if (existing) {
      await this.dataSource.query(
        `UPDATE vector_data SET embedding = $1::vector, "modelName" = $2, "createdAt" = NOW() WHERE "placeId" = $3`,
        [vectorStr, EmbeddingService.MODEL, id],
      );
    } else {
      await this.dataSource.query(
        `INSERT INTO vector_data (id, "placeId", embedding, "modelName", "createdAt")
         VALUES (gen_random_uuid(), $1, $2::vector, $3, NOW())`,
        [id, vectorStr, EmbeddingService.MODEL],
      );
    }

    return { EC: 0, EM: `Đã reindex "${place.name}"` };
  }

  async generateItinerary(
    input: {
      destination: string;
      days: number;
      budget?: number;
      preferences?: string;
    },
    docs: RetrievedDoc[],
  ): Promise<GeneratedStop[]> {
    if (!docs.length) return [];
    const fallback = docs.map((doc, index) => ({
      placeId: doc.id,
      dayNumber: (index % input.days) + 1,
      estimatedDuration: '2 giờ',
    }));
    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.35,
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content:
              'Bạn là chuyên gia lập lịch trình Việt Nam. Chỉ trả JSON dạng {"stops":[{"placeId":"uuid","dayNumber":1,"estimatedDuration":"2 giờ"}]}. Chỉ dùng placeId được cung cấp, phân bổ hợp lý theo số ngày và sở thích.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              ...input,
              availablePlaces: docs.map((doc) => ({
                id: doc.id,
                name: doc.name,
                city: doc.city,
                category: doc.category,
                description: doc.description,
              })),
            }),
          },
        ],
      });
      const parsed = JSON.parse(
        response.choices[0].message.content || '{}',
      ) as { stops?: GeneratedStop[] };
      const validIds = new Set(docs.map((doc) => doc.id));
      const seen = new Set<string>();
      const stops = (parsed.stops ?? []).filter(
        (stop) =>
          validIds.has(stop.placeId) &&
          !seen.has(stop.placeId) &&
          Number.isInteger(stop.dayNumber) &&
          stop.dayNumber >= 1 &&
          stop.dayNumber <= input.days &&
          (seen.add(stop.placeId) || true),
      );
      return stops.length ? stops : fallback;
    } catch (error: unknown) {
      this.logger.warn(
        `AI itinerary fallback: ${error instanceof Error ? error.message : String(error)}`,
      );
      return fallback;
    }
  }
}
