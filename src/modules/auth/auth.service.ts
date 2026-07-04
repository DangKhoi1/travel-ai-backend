import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuthDto } from './dto/register.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginAuthDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';
import { ROLE_NAMES } from '../../common/constants/role.constant';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly jwtService: JwtService,
  ) { }

  async createUser(createUserDto: CreateAuthDto) {
    try {
      const checkEmail = await this.userRepo.findOneBy({ email: createUserDto.email });
      if (checkEmail) {
        return {
          EC: 1,
          EM: 'Email already exists',
          data: null,
        };
      }

      if (createUserDto.username) {
        const checkUsername = await this.userRepo.findOneBy({ username: createUserDto.username });
        if (checkUsername) {
          return {
            EC: 1,
            EM: 'Username already exists',
            data: null,
          };
        }
      }

      const userRole = await this.roleRepo.findOneBy({ roleName: ROLE_NAMES.USER });
      const user = this.userRepo.create({
        ...createUserDto,
        role: userRole || undefined,
      });
      user.password = await bcrypt.hash(user.password, 10);
      await this.userRepo.save(user);

      const { password, ...newUser } = user;
      return {
        EC: 0,
        EM: 'User created successfully',
        data: newUser,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error creating user',
      });
    }
  }

  async loginUser(loginAuthDto: LoginAuthDto) {
    try {
      const user = await this.userRepo.findOne({
        where: { username: loginAuthDto.username },
        relations: ['role'],
      });
      if (!user) {
        return {
          EC: 1,
          EM: 'User not found',
          data: null,
        };
      }

      const isMatch = await bcrypt.compare(loginAuthDto.password, user.password);
      if (!isMatch) {
        return {
          EC: 1,
          EM: 'Password not match',
          data: null,
        };
      }

      // Tạo JWT token
      const payload = { sub: user.userId, email: user.email, role: user.role?.roleName };
      const accessToken = this.jwtService.sign(payload);

      const { password, ...newUser } = user;
      return {
        EC: 0,
        EM: 'User logged in successfully',
        data: {
          user: newUser,
          accessToken,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error logging in user',
      });
    }
  }
}
