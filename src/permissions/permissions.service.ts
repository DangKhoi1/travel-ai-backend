import { Injectable, OnModuleInit, Logger, RequestMethod } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from '../modules/roles/entities/role.entity';
import { PERMISSION_KEY } from '../common/decorators/permission.decorator';
import { ROLE_NAMES } from '../common/constants/role.constant';

@Injectable()
export class PermissionsService implements OnModuleInit {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) { }

  async onModuleInit() {
    this.logger.log('Scanning for @Permission decorators...');
    const controllers = this.discoveryService.getControllers();

    const adminRole = await this.roleRepo.findOneBy({ roleName: ROLE_NAMES.ADMIN });

    for (const wrapper of controllers) {
      const { instance, name: controllerName } = wrapper;
      if (!instance || typeof instance !== 'object') continue;

      const prototype = Object.getPrototypeOf(instance);
      const methods = Object.getOwnPropertyNames(prototype);

      const controllerPath = wrapper.metatype ? this.reflector.get<string>('path', wrapper.metatype) || '' : '';

      for (const methodName of methods) {
        if (methodName === 'constructor') continue;
        const method = prototype[methodName];

        const permissionName = this.reflector.get<string>(PERMISSION_KEY, method);

        if (permissionName) {
          const methodPath = this.reflector.get<string>('path', method) || '';
          const httpMethodId = this.reflector.get<number>('method', method);

          let apiPath = `/${controllerPath}`;
          if (methodPath) {
            apiPath = `${apiPath}/${methodPath}`.replace(/\/+/g, '/');
          }

          let methodStr = 'UNKNOWN';
          if (httpMethodId !== undefined) {
            methodStr = RequestMethod[httpMethodId];
          }

          let permission = await this.permissionRepo.findOneBy({ permissionName });
          if (!permission) {
            permission = this.permissionRepo.create({
              permissionName,
              apiPath,
              method: methodStr,
              module: controllerName.replace('Controller', '')
            });
            await this.permissionRepo.save(permission);
            this.logger.log(`Discovered & saved new permission: [${methodStr}] ${apiPath} -> ${permissionName}`);
          }

          if (adminRole) {
            const rolePermExists = await this.rolePermissionRepo.findOneBy({
              roleId: adminRole.roleId,
              permissionId: permission.permissionId,
            });

            if (!rolePermExists) {
              const newRolePerm = this.rolePermissionRepo.create({
                roleId: adminRole.roleId,
                permissionId: permission.permissionId,
              });
              await this.rolePermissionRepo.save(newRolePerm);
            }
          }
        }
      }
    }
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionRepo.create(createPermissionDto);
    await this.permissionRepo.save(permission);
    return {
      EC: 0,
      EM: 'Create permission successfully',
      data: permission
    }
  }

  async findAll() {
    const permissions = await this.permissionRepo.find();
    return {
      EC: 0,
      EM: 'Get all permissions successfully',
      data: permissions
    }
  }

  async findOne(id: number) {
    const permission = await this.permissionRepo.findOneBy({ permissionId: id });
    return {
      EC: 0,
      EM: 'Get permission successfully',
      data: permission
    }
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    await this.permissionRepo.update(id, updatePermissionDto);
    return {
      EC: 0,
      EM: 'Update permission successfully',
      data: null
    }
  }

  async remove(id: number) {
    await this.permissionRepo.delete(id);
    return {
      EC: 0,
      EM: 'Delete permission successfully',
      data: null
    }
  }
}
