import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn('increment')
  rolePermissionId: number;

  @Column({ name: 'roleId' })
  roleId: number;

  @Column({ name: 'permissionId' })
  permissionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId', referencedColumnName: 'roleId' })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permissionId', referencedColumnName: 'permissionId' })
  permission: Permission;
}
