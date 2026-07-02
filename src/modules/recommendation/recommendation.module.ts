import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationRequest } from './entities/recommendation-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecommendationRequest])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class RecommendationModule {}
