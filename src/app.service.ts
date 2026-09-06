import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Travel-AI API';
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'travel-ai-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
