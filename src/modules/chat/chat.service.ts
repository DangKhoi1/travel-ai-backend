import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatHistory } from './entities/chat-history.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatRepo: Repository<ChatHistory>,
  ) {}

  save(userId: string, sessionId: string, message: string, response: string) {
    return this.chatRepo.save(
      this.chatRepo.create({ userId, sessionId, message, response }),
    );
  }

  async getSession(userId: string, sessionId: string, limit = 20) {
    const history = await this.chatRepo.find({
      where: { userId, sessionId },
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 50),
    });
    return history.reverse();
  }

  getRecentSessions(userId: string) {
    return this.chatRepo
      .createQueryBuilder('chat')
      .select('chat.sessionId', 'sessionId')
      .addSelect('MAX(chat.createdAt)', 'updatedAt')
      .addSelect(
        '(ARRAY_AGG(chat.message ORDER BY chat.createdAt ASC))[1]',
        'firstMessage',
      )
      .where('chat.userId = :userId', { userId })
      .groupBy('chat.sessionId')
      .orderBy('MAX(chat.createdAt)', 'DESC')
      .limit(20)
      .getRawMany<{
        sessionId: string;
        updatedAt: string;
        firstMessage: string;
      }>();
  }

  async clearSession(userId: string, sessionId: string) {
    await this.chatRepo.delete({ userId, sessionId });
  }
}
