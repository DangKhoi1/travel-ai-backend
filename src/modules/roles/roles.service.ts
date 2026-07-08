import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RolePermission } from '../../permissions/entities/role-permission.entity';
import { ROLE_NAMES } from '../../common/constants/role.constant';
import { CreateRoleDto } from '../roles/dto/create-role.dto';
import { UpdateRoleDto } from '../roles/dto/update-role.dto';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async onModuleInit() {
    this.logger.log('Checking and seeding default roles...');
    const rolesToSeed = [
      { roleName: ROLE_NAMES.ADMIN, description: 'Administrator' },
      { roleName: ROLE_NAMES.USER, description: 'Normal User' },
    ];

    for (const roleData of rolesToSeed) {
      const exists = await this.roleRepo.findOne({
        where: { roleName: roleData.roleName },
      });
      if (!exists) {
        const newRole = this.roleRepo.create(roleData);
        await this.roleRepo.save(newRole);
        this.logger.log(`Created default role: ${roleData.roleName}`);
      }
    }
  }

  async createRole(createRoleDto: CreateRoleDto) {
    try {
      const role = await this.roleRepo.findOneBy({
        roleName: createRoleDto.roleName,
      });
      if (role) {
        throw new BadRequestException('Role already exists');
      }
      const newRole = this.roleRepo.create(createRoleDto);
      await this.roleRepo.save(newRole);
      return {
        EC: 0,
        EM: 'Create role successfully',
        data: newRole,
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) throw error;
      console.error(
        'Error in createRole:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from createRole service',
      });
    }
  }

  async getAllRoles() {
    try {
      const roles = await this.roleRepo.find();
      return {
        EC: 0,
        EM: 'Get all roles successfully',
        data: roles,
      };
    } catch (error: unknown) {
      console.error(
        'Error in getAllRoles:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from getAllRoles service',
      });
    }
  }

  async getRoleById(id: number) {
    try {
      const role = await this.roleRepo.findOneBy({ roleId: id });
      if (!role) {
        return {
          EC: 1,
          EM: 'Role not found',
          data: null,
        };
      }
      return {
        EC: 0,
        EM: 'Get role successfully',
        data: role,
      };
    } catch (error: unknown) {
      console.error(
        'Error in getRoleById:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from getRoleById service',
      });
    }
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      const role = await this.roleRepo.findOneBy({ roleId: id });
      if (!role) {
        return {
          EC: 1,
          EM: 'Role not found',
          data: null,
        };
      }
      await this.roleRepo.update(id, updateRoleDto);
      return {
        EC: 0,
        EM: 'Update role successfully',
        data: null,
      };
    } catch (error: unknown) {
      console.error(
        'Error in updateRole:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from updateRole service',
      });
    }
  }

  async deleteRole(id: number) {
    try {
      const role = await this.roleRepo.findOneBy({ roleId: id });
      if (!role) {
        return {
          EC: 1,
          EM: 'Role not found',
          data: null,
        };
      }
      await this.roleRepo.delete(id);
      return {
        EC: 0,
        EM: 'Delete role successfully',
        data: null,
      };
    } catch (error: unknown) {
      console.error(
        'Error in deleteRole:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from deleteRole service',
      });
    }
  }

  async assignPermissions(roleId: number, permissionIds: number[]) {
    try {
      const role = await this.roleRepo.findOneBy({ roleId });
      if (!role) {
        return {
          EC: 1,
          EM: 'Role not found',
          data: null,
        };
      }

      // Remove all existing permissions for this role
      await this.rolePermissionRepo.delete({ roleId });

      // Insert new permissions
      if (permissionIds && permissionIds.length > 0) {
        const newRolePerms = permissionIds.map((permissionId) =>
          this.rolePermissionRepo.create({ roleId, permissionId }),
        );
        await this.rolePermissionRepo.save(newRolePerms);
      }

      return {
        EC: 0,
        EM: 'Permissions assigned successfully',
        data: null,
      };
    } catch (error: unknown) {
      console.error(
        'Error in assignPermissions:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from assignPermissions service',
      });
    }
  }

  async getRolePermissions(roleId: number) {
    try {
      const role = await this.roleRepo.findOneBy({ roleId });
      if (!role) {
        return {
          EC: 1,
          EM: 'Role not found',
          data: null,
        };
      }

      const rolePermissions = await this.rolePermissionRepo.find({
        where: { roleId },
        relations: ['permission'],
      });

      return {
        EC: 0,
        EM: 'Get role permissions successfully',
        data: rolePermissions.map((rp) => rp.permission),
      };
    } catch (error: unknown) {
      console.error(
        'Error in getRolePermissions:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from getRolePermissions service',
      });
    }
  }
}
