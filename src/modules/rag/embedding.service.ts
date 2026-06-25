import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private openai: OpenAI;

  // Dimension phải khớp với vector(N) trong DB
  static readonly DIMENSION = 1536;  // text-embedding-3-small
  static readonly MODEL = 'text-embedding-3-small';

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Tạo embedding vector từ text
   * @param text - văn bản cần embed
   * @returns number[] - vector 1536 chiều
   */
  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: EmbeddingService.MODEL,
        input: text.replace(/\n/g, ' '),  // clean newlines
      });
      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Embedding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Chuyển array number[] → chuỗi pgvector format "[0.1, 0.2, ...]"
   */
  toVectorString(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  /**
   * Tạo text chuẩn để embed cho 1 địa điểm
   * Nên bao gồm tất cả field quan trọng để embedding chính xác
   */
  buildIndexText(place: {
    name: string;
    description: string;
    location?: string;
    region?: string;
    bestTime?: string;
    category?: string;
  }): string {
    return [
      `Tên: ${place.name}`,
      `Mô tả: ${place.description}`,
      place.location && `Địa điểm: ${place.location}`,
      place.region && `Khu vực: ${place.region}`,
      place.bestTime && `Thời điểm tốt nhất để đến: ${place.bestTime}`,
      place.category && `Loại hình: ${place.category}`,
    ]
      .filter(Boolean)
      .join('. ');
  }
}
