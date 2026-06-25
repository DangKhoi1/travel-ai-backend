import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TravelplaceService } from './travelplace.service';
import { CreateTravelplaceDto } from './dto/create-travelplace.dto';
import { UpdateTravelplaceDto } from './dto/update-travelplace.dto';

@Controller('travelplace')
export class TravelplaceController {
  constructor(private readonly travelplaceService: TravelplaceService) {}

  @Post()
  create(@Body() createTravelplaceDto: CreateTravelplaceDto) {
    return this.travelplaceService.create(createTravelplaceDto);
  }

  @Get()
  findAll() {
    return this.travelplaceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.travelplaceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTravelplaceDto: UpdateTravelplaceDto) {
    return this.travelplaceService.update(id, updateTravelplaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.travelplaceService.remove(id);
  }
}
