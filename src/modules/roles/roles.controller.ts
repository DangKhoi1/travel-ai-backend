import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Permission } from '../../common/decorators/permission.decorator';
import { CreateRoleDto } from '../roles/dto/create-role.dto';
import { UpdateRoleDto } from '../roles/dto/update-role.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('create-role')
  @Permission('Create Role')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get('get-all-roles')
  @Permission('Get All Roles')
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get('get-role/:id')
  @Permission('Get Role')
  async getRoleById(@Param('id') id: number) {
    return this.rolesService.getRoleById(id);
  }

  @Put('update-role/:id')
  @Permission('Update Role')
  async updateRole(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @Delete('delete-role/:id')
  @Permission('Delete Role')
  async deleteRole(@Param('id') id: number) {
    return this.rolesService.deleteRole(id);
  }

  @Post(':id/assign-permissions')
  @Permission('Assign Permissions')
  async assignPermissions(
    @Param('id') id: number,
    @Body('permissionIds') permissionIds: number[],
  ) {
    return this.rolesService.assignPermissions(id, permissionIds);
  }

  @Get(':id/permissions')
  @Permission('Get Role Permissions')
  async getRolePermissions(@Param('id') id: number) {
    return this.rolesService.getRolePermissions(id);
  }
}
