import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationRequest } from './entities/recommendation-request.entity';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { RagModule } from '../rag/rag.module';
import { Favorite } from '../favorite/entities/favorite.entity';
import { Review } from '../review/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecommendationRequest, Favorite, Review]),
    RagModule,
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
  exports: [TypeOrmModule, RecommendationService],
})
export class RecommendationModule {}
