import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTravelplaceDto } from './dto/create-travelplace.dto';
import { UpdateTravelplaceDto } from './dto/update-travelplace.dto';
import { TravelPlace } from './entities/travelplace.entity';

@Injectable()
export class TravelplaceService {
  private readonly logger = new Logger(TravelplaceService.name);
  constructor(
    @InjectRepository(TravelPlace)
    private readonly travelplaceRepo: Repository<TravelPlace>,
  ) {}

  async create(dto: CreateTravelplaceDto) {
    try {
      const place = await this.travelplaceRepo.save(
        this.travelplaceRepo.create(dto),
      );
      return { EC: 0, EM: 'Travelplace created successfully', data: place };
    } catch (error: unknown) {
      this.fail('create', error);
    }
  }

  async findAll(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      city?: string;
    } = {},
  ) {
    try {
      const page = Math.max(Number(options.page) || 1, 1);
      const limit = Math.min(Math.max(Number(options.limit) || 12, 1), 50);
      const query = this.travelplaceRepo
        .createQueryBuilder('place')
        .leftJoin('place.reviews', 'review')
        .addSelect('COALESCE(AVG(review.rating), 0)', 'averageRating')
        .addSelect('COUNT(review.id)', 'reviewCount')
        .groupBy('place.id')
        .orderBy('place.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);
      if (options.search?.trim()) {
        const search = options.search.trim();
        query.andWhere(
          `(to_tsvector('simple', coalesce(place.name, '') || ' ' || coalesce(place.description, '') || ' ' || coalesce(place.city, '') || ' ' || coalesce(place.country, '') || ' ' || coalesce(place.category, '')) @@ websearch_to_tsquery('simple', :fullText) OR place.name ILIKE :fuzzySearch)`,
          { fullText: search, fuzzySearch: `%${search}%` },
        );
      }
      if (options.category?.trim())
        query.andWhere('LOWER(place.category) = LOWER(:category)', {
          category: options.category.trim(),
        });
      if (options.city?.trim())
        query.andWhere('LOWER(place.city) = LOWER(:city)', {
          city: options.city.trim(),
        });
      const total = await query
        .clone()
        .skip(undefined)
        .take(undefined)
        .getCount();
      const { entities, raw } = await query.getRawAndEntities();
      const ratings = raw as Array<{
        averageRating?: string | number;
        reviewCount?: string | number;
      }>;
      const items = entities.map((place, index) => ({
        ...place,
        averageRating: Number(ratings[index]?.averageRating ?? 0),
        reviewCount: Number(ratings[index]?.reviewCount ?? 0),
      }));
      return {
        EC: 0,
        EM: 'Travelplaces retrieved successfully',
        data: {
          items,
          meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
      };
    } catch (error: unknown) {
      this.fail('findAll', error);
    }
  }

  async findOne(id: string) {
    try {
      const place = await this.travelplaceRepo.findOne({
        where: { id },
        relations: ['reviews', 'reviews.user'],
      });
      if (!place) return { EC: 1, EM: 'Travelplace not found', data: null };
      const reviews = place.reviews.map((review) => ({
        ...review,
        user: review.user
          ? {
              userId: review.user.userId,
              username: review.user.username,
              fullName: review.user.fullName,
              avatar: review.user.avatar,
            }
          : undefined,
      }));
      const averageRating = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;
      return {
        EC: 0,
        EM: 'Travelplace found',
        data: { ...place, reviews, averageRating, reviewCount: reviews.length },
      };
    } catch (error: unknown) {
      this.fail('findOne', error);
    }
  }

  async update(id: string, dto: UpdateTravelplaceDto) {
    const place = await this.travelplaceRepo.findOneBy({ id });
    if (!place) return { EC: 1, EM: 'Travelplace not found', data: null };
    return {
      EC: 0,
      EM: 'Travelplace updated successfully',
      data: await this.travelplaceRepo.save(
        this.travelplaceRepo.merge(place, dto),
      ),
    };
  }

  async remove(id: string) {
    const result = await this.travelplaceRepo.delete(id);
    return result.affected
      ? { EC: 0, EM: 'Travelplace deleted successfully', data: null }
      : { EC: 1, EM: 'Travelplace not found', data: null };
  }

  private fail(operation: string, error: unknown): never {
    this.logger.error(
      `${operation} failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new InternalServerErrorException({
      EC: 1,
      EM: 'Travelplace operation failed',
    });
  }
}
