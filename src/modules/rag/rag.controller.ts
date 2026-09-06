import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { RagService } from './rag.service';
import { ChatDto } from './dto/chat.dto';
import { CreateTravelplaceDto } from '../travelplace/dto/create-travelplace.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLE_NAMES } from '../../common/constants/role.constant';

@Controller('rag')
@UseGuards(JwtAuthGuard)
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('chat')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async chat(
    @Body() dto: ChatDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.ragService.chat(
      req.user.userId,
      dto.message,
      dto.sessionId,
      dto.topK,
    );
  }

  @Post('chat/stream')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async streamChat(
    @Body() dto: ChatDto,
    @Request() req: { user: { userId: string } },
    @Res() response: Response,
  ) {
    response.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('X-Accel-Buffering', 'no');
    try {
      for await (const event of this.ragService.streamChat(
        req.user.userId,
        dto.message,
        dto.sessionId,
        dto.topK,
      ))
        response.write(`${JSON.stringify(event)}\n`);
    } catch (error: unknown) {
      response.write(
        `${JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : 'Streaming failed' })}\n`,
      );
    } finally {
      response.end();
    }
  }

  @Post('index')
  @UseGuards(RolesGuard)
  @Roles(ROLE_NAMES.ADMIN)
  async index(@Body() dto: CreateTravelplaceDto) {
    return this.ragService.indexPlace(dto);
  }

  @Get('retrieve')
  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async retrieve(@Query('q') query: string, @Query('topK') topK = '3') {
    const docs = await this.ragService.retrieve(query, parseInt(topK));
    return { EC: 0, EM: 'Retrieved', data: docs };
  }

  @Post('reindex/:id')
  @UseGuards(RolesGuard)
  @Roles(ROLE_NAMES.ADMIN)
  async reindex(@Param('id') id: string) {
    return this.ragService.reindexPlace(id);
  }
}
