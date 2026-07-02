import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { EmbeddingService } from './embedding.service';
import { TravelPlace } from '../travelplace/entities/travelplace.entity';
import { VectorData } from './entities/vector-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TravelPlace, VectorData])],
  controllers: [RagController],
  providers: [RagService, EmbeddingService],
  exports: [RagService, EmbeddingService],
})
export class RagModule {}
