import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateTravelplaceDto } from './dto/create-travelplace.dto';
import { UpdateTravelplaceDto } from './dto/update-travelplace.dto';
import { TravelplaceService } from './travelplace.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { ROLE_NAMES } from '../../common/constants/role.constant';

@Controller('travelplace')
@UseGuards(JwtAuthGuard)
export class TravelplaceController {
  constructor(private readonly service: TravelplaceService) {}

  @Public()
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('city') city?: string,
  ) {
    return this.service.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
      category,
      city,
    });
  }

  @Public()
  @Get('find-all')
  findAllLegacy() {
    return this.service.findAll({ limit: 50 });
  }

  @Public()
  @Get('find-by-id/:id')
  findOneLegacy(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(ROLE_NAMES.ADMIN)
  @Permission('Create Travelplace')
  create(@Body() dto: CreateTravelplaceDto) {
    return this.service.create(dto);
  }

  @Post('add-travelplace')
  @UseGuards(RolesGuard)
  @Roles(ROLE_NAMES.ADMIN)
  @Permission('Create Travelplace')
  createLegacy(@Body() dto: CreateTravelplaceDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(ROLE_NAMES.ADMIN)
  @Permission('Update Travelplace')
  update(@Param('id') id: string, @Body() dto: UpdateTravelplaceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(ROLE_NAMES.ADMIN)
  @Permission('Delete Travelplace')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
