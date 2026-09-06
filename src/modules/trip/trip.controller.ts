import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Permission } from '../../common/decorators/permission.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AddTripPlaceDto } from './dto/add-trip-place.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { ReorderTripPlacesDto } from './dto/reorder-trip-places.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripService } from './trip.service';
import { GenerateTripDto } from './dto/generate-trip.dto';
import { OptimizeTripDayDto } from './dto/optimize-trip-day.dto';

type AuthenticatedRequest = { user: { userId: string } };

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @Permission('Create Trip')
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateTripDto) {
    return this.tripService.create(req.user.userId, dto);
  }

  @Post('generate')
  @Permission('Create Trip')
  generate(@Request() req: AuthenticatedRequest, @Body() dto: GenerateTripDto) {
    return this.tripService.generate(req.user.userId, dto);
  }

  @Get()
  @Permission('Get My Trips')
  findAll(@Request() req: AuthenticatedRequest) {
    return this.tripService.findAll(req.user.userId);
  }

  @Get(':id')
  @Permission('Get Trip')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tripService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @Permission('Update Trip')
  update(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateTripDto,
  ) {
    return this.tripService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @Permission('Delete Trip')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tripService.remove(id, req.user.userId);
  }

  @Post(':id/places')
  @Permission('Update Trip')
  addPlace(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: AddTripPlaceDto,
  ) {
    return this.tripService.addPlace(id, req.user.userId, dto);
  }

  @Delete(':id/places/:selectionId')
  @Permission('Update Trip')
  removePlace(
    @Param('id') id: string,
    @Param('selectionId') selectionId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tripService.removePlace(id, selectionId, req.user.userId);
  }

  @Patch(':id/places/reorder')
  @Permission('Update Trip')
  reorder(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: ReorderTripPlacesDto,
  ) {
    return this.tripService.reorder(id, req.user.userId, dto);
  }

  @Post(':id/places/optimize')
  @Permission('Update Trip')
  optimize(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: OptimizeTripDayDto,
  ) {
    return this.tripService.optimizeDay(id, req.user.userId, dto.dayNumber);
  }

  @Patch(':id/expenses')
  @Permission('Update Trip')
  updateExpense(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.tripService.updateExpense(id, req.user.userId, dto);
  }

  @Patch(':id/share')
  @Permission('Update Trip')
  share(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: { enabled: boolean },
  ) {
    return this.tripService.share(id, req.user.userId, dto.enabled !== false);
  }
}

@Controller('shared-trips')
export class PublicTripController {
  constructor(private readonly tripService: TripService) {}

  @Get(':token')
  findPublic(@Param('token') token: string) {
    return this.tripService.findPublic(token);
  }
}
