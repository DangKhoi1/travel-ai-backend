import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private openai: OpenAI;

  // Dimension phải khớp với vector(N) trong DB
  static readonly DIMENSION = 1536; // text-embedding-3-small
  static readonly MODEL = 'text-embedding-3-small';

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: EmbeddingService.MODEL,
        input: text.replace(/\n/g, ' '), // clean newlines
      });
      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Embedding failed: ${error.message}`);
      throw error;
    }
  }

  toVectorString(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  buildIndexText(place: {
    name: string;
    description: string;
    city?: string;
    country?: string;
    bestSeason?: string;
    category?: string;
  }): string {
    return [
      `Tên: ${place.name}`,
      `Mô tả: ${place.description}`,
      place.city && `Thành phố: ${place.city}`,
      place.country && `Quốc gia: ${place.country}`,
      place.bestSeason && `Mùa tốt nhất để đến: ${place.bestSeason}`,
      place.category && `Loại hình: ${place.category}`,
    ]
      .filter(Boolean)
      .join('. ');
  }
}
