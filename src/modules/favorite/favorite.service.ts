import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite) private readonly repo: Repository<Favorite>,
  ) {}
  async list(userId: string) {
    return {
      EC: 0,
      EM: 'Favorites retrieved',
      data: await this.repo.find({
        where: { userId },
        relations: ['place'],
        order: { createdAt: 'DESC' },
      }),
    };
  }
  async toggle(userId: string, placeId: string) {
    const existing = await this.repo.findOneBy({ userId, placeId });
    if (existing) {
      await this.repo.remove(existing);
      return { EC: 0, EM: 'Removed from favorites', data: { favorite: false } };
    }
    await this.repo.save(this.repo.create({ userId, placeId }));
    return { EC: 0, EM: 'Added to favorites', data: { favorite: true } };
  }
  async check(userId: string, placeId: string) {
    return {
      EC: 0,
      EM: 'Favorite status',
      data: { favorite: !!(await this.repo.findOneBy({ userId, placeId })) },
    };
  }
}
