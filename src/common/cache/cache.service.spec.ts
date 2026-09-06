import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  it('stores and retrieves values with the memory fallback', async () => {
    const config = { get: jest.fn().mockReturnValue(undefined) };
    const service = new CacheService(config as unknown as ConfigService);

    await service.set('recommendation:test', { placeId: 'place-1' }, 60);

    await expect(service.get('recommendation:test')).resolves.toEqual({
      placeId: 'place-1',
    });
  });
});
