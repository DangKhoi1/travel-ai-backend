import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RagService } from '../rag/rag.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { RecommendationRequest } from './entities/recommendation-request.entity';
import { Favorite } from '../favorite/entities/favorite.entity';
import { Review } from '../review/entities/review.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(RecommendationRequest)
    private readonly requestRepo: Repository<RecommendationRequest>,
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    private readonly ragService: RagService,
  ) {}

  async recommend(userId: string, dto: CreateRecommendationDto) {
    const [favorites, positiveReviews] = await Promise.all([
      this.favoriteRepo.find({
        where: { userId },
        relations: ['place'],
        order: { createdAt: 'DESC' },
        take: 8,
      }),
      this.reviewRepo
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.place', 'place')
        .where('review.userId = :userId', { userId })
        .andWhere('review.rating >= 4')
        .orderBy('review.createdAt', 'DESC')
        .take(8)
        .getMany(),
    ]);
    const behavior = [
      ...favorites.map((item) => item.place),
      ...positiveReviews.map((item) => item.place),
    ]
      .flatMap((place) => [place.name, place.category, place.city])
      .filter(Boolean)
      .join(', ');
    const query = [
      dto.destination,
      dto.preferences,
      behavior ? `Sở thích đã thể hiện: ${behavior}` : '',
      dto.budget ? `ngân sách ${dto.budget}` : '',
      dto.days ? `${dto.days} ngày` : '',
    ]
      .filter(Boolean)
      .join('. ');
    const places = await this.ragService.retrieve(query, 8);
    const request = await this.requestRepo.save(
      this.requestRepo.create({
        userId,
        budget: dto.budget,
        days: dto.days,
        preferences: dto.preferences,
        recommendedResult: JSON.stringify(places),
      }),
    );
    return {
      EC: 0,
      EM: 'Recommendations generated',
      data: { requestId: request.id, places },
    };
  }

  async history(userId: string) {
    const requests = await this.requestRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
    return {
      EC: 0,
      EM: 'Recommendation history retrieved',
      data: requests.map((request) => ({
        ...request,
        recommendedResult: this.parse(request.recommendedResult),
      })),
    };
  }

  private parse(value: string) {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return [];
    }
  }
}
