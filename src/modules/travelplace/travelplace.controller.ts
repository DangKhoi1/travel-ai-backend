import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TravelplaceService } from './travelplace.service';
import { CreateTravelplaceDto } from './dto/create-travelplace.dto';
import { UpdateTravelplaceDto } from './dto/update-travelplace.dto';

@Controller('travelplace')
export class TravelplaceController {
  constructor(private readonly travelplaceService: TravelplaceService) { }

  @Post('add-travelplace')
  create(@Body() createTravelplaceDto: CreateTravelplaceDto) {
    return this.travelplaceService.create(createTravelplaceDto);
  }

  @Get('find-all')
  findAllTravelplace() {
    return this.travelplaceService.findAll();
  }

  @Get('find-by-id/:id')
  findOneTravelplace(@Param('id') id: string) {
    return this.travelplaceService.findOne(id);
  }

  @Patch('update-travelplace/:id')
  updateTravelplace(@Param('id') id: string, @Body() updateTravelplaceDto: UpdateTravelplaceDto) {
    return this.travelplaceService.update(id, updateTravelplaceDto);
  }

  @Delete('delete-travelplace/:id')
  removeTravelplace(@Param('id') id: string) {
    return this.travelplaceService.remove(id);
  }
}
