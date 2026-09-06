import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(private readonly service: RecommendationService) {}

  @Post()
  recommend(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateRecommendationDto,
  ) {
    return this.service.recommend(req.user.userId, dto);
  }

  @Get('history')
  history(@Request() req: { user: { userId: string } }) {
    return this.service.history(req.user.userId);
  }
}
