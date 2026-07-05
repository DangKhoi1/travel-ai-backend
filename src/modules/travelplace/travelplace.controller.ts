import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TravelplaceService } from './travelplace.service';
import { CreateTravelplaceDto } from './dto/create-travelplace.dto';
import { UpdateTravelplaceDto } from './dto/update-travelplace.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Permission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('travelplace')
@UseGuards(JwtAuthGuard)
export class TravelplaceController {
  constructor(private readonly travelplaceService: TravelplaceService) { }

  @Post('add-travelplace')
  @Permission("Create Travelplace")
  create(@Body() createTravelplaceDto: CreateTravelplaceDto) {
    return this.travelplaceService.create(createTravelplaceDto);
  }

  @Public()
  @Get('find-all')
  findAllTravelplace() {
    return this.travelplaceService.findAll();
  }

  @Public()
  @Get('find-by-id/:id')
  findOneTravelplace(@Param('id') id: string) {
    return this.travelplaceService.findOne(id);
  }

  @Patch('update-travelplace/:id')
  @Permission("Update Travelplace")
  updateTravelplace(@Param('id') id: string, @Body() updateTravelplaceDto: UpdateTravelplaceDto) {
    return this.travelplaceService.update(id, updateTravelplaceDto);
  }

  @Delete('delete-travelplace/:id')
  @Permission("Delete Travelplace")
  removeTravelplace(@Param('id') id: string) {
    return this.travelplaceService.remove(id);
  }
}
