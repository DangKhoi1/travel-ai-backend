import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { RagService } from './rag.service';
import { ChatDto } from './dto/chat.dto';
import { CreateTravelplaceDto } from '../travelplace/dto/create-travelplace.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  /**
   * POST /api/v1/rag/chat
   * User hỏi → RAG trả lời
   *
   * Body: { "message": "Tháng 6 nên đi biển ở đâu miền Trung?", "topK": 3 }
   */
  @Post('chat')
  async chat(@Body() dto: ChatDto) {
    return this.ragService.chat(dto.message, dto.topK);
  }

  /**
   * POST /api/v1/rag/index
   * Thêm địa điểm mới vào knowledge base (có tạo embedding)
   *
   * Body: CreateTravelplaceDto
   */
  @Post('index')
  async index(@Body() dto: CreateTravelplaceDto) {
    return this.ragService.indexPlace(dto);
  }

  /**
   * GET /api/v1/rag/retrieve?q=...&topK=3
   * Debug endpoint: xem context sẽ được retrieve cho query nào
   */
  @Get('retrieve')
  async retrieve(
    @Query('q') query: string,
    @Query('topK') topK = '3',
  ) {
    const docs = await this.ragService.retrieve(query, parseInt(topK));
    return { EC: 0, EM: 'Retrieved', data: docs };
  }

  /**
   * POST /api/v1/rag/reindex/:id
   * Tạo lại embedding cho 1 địa điểm (sau khi update description)
   */
  @Post('reindex/:id')
  async reindex(@Param('id') id: string) {
    return this.ragService.reindexPlace(id);
  }
}
