import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { RagService } from './rag.service';
import { ChatDto } from './dto/chat.dto';
import { CreateTravelplaceDto } from '../travelplace/dto/create-travelplace.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('chat')
  async chat(@Body() dto: ChatDto) {
    return this.ragService.chat(dto.message, dto.topK);
  }

  @Post('index')
  async index(@Body() dto: CreateTravelplaceDto) {
    return this.ragService.indexPlace(dto);
  }

  @Get('retrieve')
  async retrieve(@Query('q') query: string, @Query('topK') topK = '3') {
    const docs = await this.ragService.retrieve(query, parseInt(topK));
    return { EC: 0, EM: 'Retrieved', data: docs };
  }

  @Post('reindex/:id')
  async reindex(@Param('id') id: string) {
    return this.ragService.reindexPlace(id);
  }
}
