import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Permission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('review')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create')
  @Permission('Create Review')
  createReview(
    @Request() req: { user: { sub: string } },
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.createReview(req.user.sub, createReviewDto);
  }

  @Public()
  @Get('place/:placeId')
  getReviewsByPlace(@Param('placeId') placeId: string) {
    return this.reviewService.getReviewsByPlace(placeId);
  }

  @Get('my-reviews')
  @Permission('Get My Reviews')
  getMyReviews(@Request() req: { user: { sub: string } }) {
    return this.reviewService.getReviewsByUser(req.user.sub);
  }

  @Patch('update/:id')
  @Permission('Update Review')
  updateReview(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(id, req.user.sub, updateReviewDto);
  }

  @Delete('delete/:id')
  @Permission('Delete Review')
  deleteReview(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.reviewService.deleteReview(id, req.user.sub);
  }
}
