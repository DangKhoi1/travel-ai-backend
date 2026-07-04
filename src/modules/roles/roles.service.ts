import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { ROLE_NAMES } from '../../common/constants/role.constant';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) { }

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
}
