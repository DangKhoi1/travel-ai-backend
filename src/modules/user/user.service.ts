import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const checkEmail = await this.userRepo.findOneBy({
        email: createUserDto.email,
      });
      if (checkEmail) {
        return {
          EC: 1,
          EM: 'Email already exists',
          data: null,
        };
      }

      if (createUserDto.username) {
        const checkUsername = await this.userRepo.findOneBy({
          username: createUserDto.username,
        });
        if (checkUsername) {
          return {
            EC: 1,
            EM: 'Username already exists',
            data: null,
          };
        }
      }
      const user = this.userRepo.create(createUserDto);
      await this.userRepo.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...newUser } = user;
      return {
        EC: 0,
        EM: 'User created successfully',
        data: newUser,
      };
    } catch (error: unknown) {
      console.error(
        'Error in createUser:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from createUser service',
      });
    }
  }

  async findAllUsers() {
    try {
      const users = await this.userRepo.find({ relations: ['role'] });
      const result = users.map((user) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...rest } = user;
        return rest;
      });
      if (result.length === 0) {
        return {
          EC: 1,
          EM: 'No users found',
          data: null,
        };
      }
      return {
        EC: 0,
        EM: 'Find all users successfully',
        data: result,
      };
    } catch (error: unknown) {
      console.error(
        'Error in findAllUsers:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from findAllUsers service',
      });
    }
  }

  async findUserById(userId: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { userId },
        relations: ['role'],
      });
      if (!user) {
        return {
          EC: 1,
          EM: 'User not found',
          data: null,
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...newUser } = user;
      return {
        EC: 0,
        EM: 'Find user by ID successfully',
        data: newUser,
      };
    } catch (error: unknown) {
      console.error(
        'Error in findUserById:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from findUserById service',
      });
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepo.findOneBy({ userId });
      if (!user) {
        return {
          EC: 1,
          EM: 'User not found',
          data: null,
        };
      }
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }
      const updatedUser = this.userRepo.merge(user, updateUserDto);
      await this.userRepo.save(updatedUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...newUser } = updatedUser;
      return {
        EC: 0,
        EM: 'User updated successfully',
        data: newUser,
      };
    } catch (error: unknown) {
      console.error(
        'Error in updateUser:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from updateUser service',
      });
    }
  }

  async deleteUser(userId: string) {
    try {
      const user = await this.userRepo.findOneBy({ userId });
      if (!user) {
        return {
          EC: 1,
          EM: 'User not found',
          data: null,
        };
      }
      await this.userRepo.delete(userId);
      return {
        EC: 0,
        EM: 'User deleted successfully',
        data: null,
      };
    } catch (error: unknown) {
      console.error(
        'Error in deleteUser:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from deleteUser service',
      });
    }
  }
}
