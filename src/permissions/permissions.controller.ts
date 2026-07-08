import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Permission } from '../common/decorators/permission.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('get-all')
  @Permission('Get All Permissions')
  findAll() {
    return this.permissionsService.findAll();
  }
}
