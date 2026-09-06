import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ChatService } from './chat.service';

type AuthenticatedRequest = { user: { userId: string } };

@Controller('chat-history')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  async getSessions(@Request() req: AuthenticatedRequest) {
    return {
      EC: 0,
      EM: 'Chat sessions retrieved',
      data: await this.chatService.getRecentSessions(req.user.userId),
    };
  }

  @Get(':sessionId')
  async getSession(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return {
      EC: 0,
      EM: 'Chat history retrieved',
      data: await this.chatService.getSession(
        req.user.userId,
        sessionId,
        Number(limit) || 20,
      ),
    };
  }

  @Delete(':sessionId')
  async clear(
    @Param('sessionId') sessionId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.chatService.clearSession(req.user.userId, sessionId);
    return { EC: 0, EM: 'Chat session deleted', data: null };
  }
}
