import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly memory = new Map<
    string,
    { value: string; expiresAt: number }
  >();
  private readonly redis?: Redis;

  constructor(config: ConfigService) {
    const url = config.get<string>('REDIS_URL');
    if (url) {
      this.redis = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      });
      this.redis
        .connect()
        .catch((error: Error) =>
          this.logger.warn(
            `Redis unavailable, using memory cache: ${error.message}`,
          ),
        );
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis?.status === 'ready') {
        const value = await this.redis.get(key);
        return value ? (JSON.parse(value) as T) : null;
      }
    } catch {
      /* use memory fallback */
    }
    const entry = this.memory.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return JSON.parse(entry.value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds = 300) {
    const serialized = JSON.stringify(value);
    try {
      if (this.redis?.status === 'ready') {
        await this.redis.set(key, serialized, 'EX', ttlSeconds);
        return;
      }
    } catch {
      /* use memory fallback */
    }
    this.memory.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    if (this.memory.size > 500)
      this.memory.delete(this.memory.keys().next().value as string);
  }

  async onModuleDestroy() {
    if (this.redis) await this.redis.quit().catch(() => undefined);
  }
}
