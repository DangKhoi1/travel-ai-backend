import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Permission } from '../common/decorators/permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { ROLE_NAMES } from '../common/constants/role.constant';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_NAMES.ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('get-all')
  @Permission('Get All Permissions')
  findAll() {
    return this.permissionsService.findAll();
  }
}
