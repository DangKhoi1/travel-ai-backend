import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { EmbeddingService } from './embedding.service';
import { TravelPlace } from '../travelplace/entities/travelplace.entity';
import { VectorData } from './entities/vector-data.entity';
import { CreateTravelplaceDto } from '../travelplace/dto/create-travelplace.dto';

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
  } | null;
}

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
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async indexPlace(dto: CreateTravelplaceDto): Promise<{ EC: number; EM: string; data: any }> {
    try {
      // 1. Tạo địa điểm trong bảng travel_places
      const place = this.travelplaceRepo.create(dto);
      await this.travelplaceRepo.save(place);

      // 2. Tạo embedding và lưu vào bảng vector_data
      const textToEmbed = this.embeddingService.buildIndexText(dto);
      this.logger.log(`Indexing: "${dto.name}" | Text: ${textToEmbed.substring(0, 80)}...`);

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
}
