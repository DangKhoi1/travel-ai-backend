import { Injectable } from '@nestjs/common';
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
  ) { }

  async createUser(createUserDto: CreateUserDto) {
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
    const user = this.userRepo.create(createUserDto);
    await this.userRepo.save(user);
    const { password, ...newUser } = user;
    return {
      EC: 0,
      EM: 'User created successfully',
      data: newUser,
    };
  }

  async findAllUsers() {
    const users = await this.userRepo.find();
    const result = users.map((user) => {
      const { password, ...rest } = user;
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
  }

  async findUserById(userId: string) {
    const user = await this.userRepo.findOneBy({ userId });
    if (!user) {
      return {
        EC: 1,
        EM: 'User not found',
        data: null,
      };
    }
    const { password, ...newUser } = user;
    return {
      EC: 0,
      EM: 'Find user by ID successfully',
      data: newUser,
    };
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
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
    const { password, ...newUser } = updatedUser;
    return {
      EC: 0,
      EM: 'User updated successfully',
      data: newUser,
    };
  }

  async deleteUser(userId: string) {
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
  }
}
