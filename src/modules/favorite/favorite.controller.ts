import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { FavoriteService } from './favorite.service';

class ToggleFavoriteDto {
  @IsUUID() placeId: string;
}

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private readonly service: FavoriteService) {}
  @Get() list(@Request() req: { user: { userId: string } }) {
    return this.service.list(req.user.userId);
  }
  @Post('toggle') toggle(
    @Request() req: { user: { userId: string } },
    @Body() dto: ToggleFavoriteDto,
  ) {
    return this.service.toggle(req.user.userId, dto.placeId);
  }
  @Get(':placeId') check(
    @Request() req: { user: { userId: string } },
    @Param('placeId') placeId: string,
  ) {
    return this.service.check(req.user.userId, placeId);
  }
}
