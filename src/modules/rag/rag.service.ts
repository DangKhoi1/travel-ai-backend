import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { EmbeddingService } from './embedding.service';
import { Travelplace } from '../travelplace/entities/travelplace.entity';
import { CreateTravelplaceDto } from '../travelplace/dto/create-travelplace.dto';

export interface RetrievedDoc {
  id: string;
  name: string;
  description: string;
  location: string;
  region: string;
  bestTime: string;
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
  } | null;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private openai: OpenAI;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Travelplace)
    private travelplaceRepo: Repository<Travelplace>,
    private embeddingService: EmbeddingService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async indexPlace(dto: CreateTravelplaceDto): Promise<{ EC: number; EM: string; data: any }> {
    try {
      const textToEmbed = this.embeddingService.buildIndexText(dto);
      this.logger.log(`Indexing: "${dto.name}" | Text: ${textToEmbed.substring(0, 80)}...`);

      const embedding = await this.embeddingService.embed(textToEmbed);
      const vectorStr = this.embeddingService.toVectorString(embedding);

      const result = await this.dataSource.query(
        `INSERT INTO travelplaces (id, name, description, location, region, "bestTime", category, "entryFee", embedding, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8::vector, NOW(), NOW())
         RETURNING id, name, location`,
        [
          dto.name,
          dto.description,
          dto.location ?? null,
          dto.region ?? null,
          dto.bestTime ?? null,
          dto.category ?? null,
          dto.entryFee ?? null,
          vectorStr,
        ],
      );

      return {
        EC: 0,
        EM: `Đã thêm "${dto.name}" vào knowledge base`,
        data: result[0],
      };
    } catch (error) {
      this.logger.error(`Index failed: ${error.message}`);
      return { EC: 1, EM: error.message, data: null };
    }
  }

  async retrieve(query: string, topK = 3): Promise<RetrievedDoc[]> {
    const queryEmbedding = await this.embeddingService.embed(query);
    const vectorStr = this.embeddingService.toVectorString(queryEmbedding);

    const results = await this.dataSource.query(
      `SELECT
        id, name, description, location, region, "bestTime", category,
        1 - (embedding <=> $1::vector) AS similarity
       FROM travelplaces
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [vectorStr, topK],
    );

    return results;
  }

  async chat(message: string, topK = 3): Promise<ChatResponse> {
    try {
      const docs = await this.retrieve(message, topK);

      if (docs.length === 0) {
        const fallbackAnswer = await this.generate(message, []);
        return {
          EC: 0,
          EM: 'Answered without context (knowledge base empty)',
          data: { answer: fallbackAnswer, sources: [], query: message },
        };
      }

      const answer = await this.generate(message, docs);

      return {
        EC: 0,
        EM: 'Success',
        data: {
          answer,
          sources: docs,
          query: message,
        },
      };
    } catch (error) {
      this.logger.error(`Chat failed: ${error.message}`);
      return { EC: 1, EM: error.message, data: null };
    }
  }

  private async generate(query: string, docs: RetrievedDoc[]): Promise<string> {
    const contextBlock =
      docs.length > 0
        ? docs
            .map(
              (d, i) =>
                `[Nguồn ${i + 1}] ${d.name}
  - Địa điểm: ${d.location ?? 'Không rõ'}
  - Khu vực: ${d.region ?? 'Không rõ'}
  - Thời điểm tốt nhất: ${d.bestTime ?? 'Quanh năm'}
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
        { role: 'user', content: query },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return response.choices[0].message.content ?? 'Xin lỗi, tôi không thể trả lời lúc này.';
  }

  async reindexPlace(id: string): Promise<{ EC: number; EM: string }> {
    const place = await this.travelplaceRepo.findOneBy({ id });
    if (!place) return { EC: 1, EM: 'Place not found' };

    const textToEmbed = this.embeddingService.buildIndexText(place);
    const embedding = await this.embeddingService.embed(textToEmbed);
    const vectorStr = this.embeddingService.toVectorString(embedding);

    await this.dataSource.query(
      `UPDATE travelplaces SET embedding = $1::vector, "updatedAt" = NOW() WHERE id = $2`,
      [vectorStr, id],
    );

    return { EC: 0, EM: `Đã reindex "${place.name}"` };
  }
}
