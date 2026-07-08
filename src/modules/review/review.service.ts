import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    try {
      // Kiểm tra user đã đánh giá địa điểm này chưa
      const existingReview = await this.reviewRepo.findOneBy({
        userId,
        placeId: createReviewDto.placeId,
      });
      if (existingReview) {
        return {
          EC: 1,
          EM: 'You have already reviewed this place',
          data: null,
        };
      }

      const review = this.reviewRepo.create({
        ...createReviewDto,
        userId,
      });
      await this.reviewRepo.save(review);
      return {
        EC: 0,
        EM: 'Review created successfully',
        data: review,
      };
    } catch (error: unknown) {
      console.error(
        'Error in createReview:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from createReview service',
      });
    }
  }

  async getReviewsByPlace(placeId: string) {
    try {
      const reviews = await this.reviewRepo.find({
        where: { placeId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });

      // Ẩn password khi trả về thông tin user
      const safeReviews = reviews.map((review) => {
        if (review.user) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password: _, ...safeUser } = review.user;
          return { ...review, user: safeUser };
        }
        return review;
      });

      return {
        EC: 0,
        EM: 'Get reviews by place successfully',
        data: safeReviews,
      };
    } catch (error: unknown) {
      console.error(
        'Error in getReviewsByPlace:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from getReviewsByPlace service',
      });
    }
  }

  async getReviewsByUser(userId: string) {
    try {
      const reviews = await this.reviewRepo.find({
        where: { userId },
        relations: ['place'],
        order: { createdAt: 'DESC' },
      });
      return {
        EC: 0,
        EM: 'Get reviews by user successfully',
        data: reviews,
      };
    } catch (error: unknown) {
      console.error(
        'Error in getReviewsByUser:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from getReviewsByUser service',
      });
    }
  }

  async updateReview(
    reviewId: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    try {
      const review = await this.reviewRepo.findOneBy({ id: reviewId, userId });
      if (!review) {
        return {
          EC: 1,
          EM: 'Review not found or you are not the owner',
          data: null,
        };
      }

      const updatedReview = this.reviewRepo.merge(review, updateReviewDto);
      await this.reviewRepo.save(updatedReview);
      return {
        EC: 0,
        EM: 'Review updated successfully',
        data: updatedReview,
      };
    } catch (error: unknown) {
      console.error(
        'Error in updateReview:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from updateReview service',
      });
    }
  }

  async deleteReview(reviewId: string, userId: string) {
    try {
      const review = await this.reviewRepo.findOneBy({ id: reviewId, userId });
      if (!review) {
        return {
          EC: 1,
          EM: 'Review not found or you are not the owner',
          data: null,
        };
      }

      await this.reviewRepo.delete(reviewId);
      return {
        EC: 0,
        EM: 'Review deleted successfully',
        data: null,
      };
    } catch (error: unknown) {
      console.error(
        'Error in deleteReview:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from deleteReview service',
      });
    }
  }
}
