import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { EmbeddingService } from './embedding.service';
import { Travelplace } from '../travelplace/entities/travelplace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Travelplace])],
  controllers: [RagController],
  providers: [RagService, EmbeddingService],
  exports: [RagService, EmbeddingService],
})
export class RagModule {}
