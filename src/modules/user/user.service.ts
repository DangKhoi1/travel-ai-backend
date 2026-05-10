import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly UserRepo: Repository<User>
  ) { }
  async createUser(createUserDto: CreateUserDto) {
    const user = this.UserRepo.create(createUserDto);
    const checkEmail = await this.UserRepo.findOneBy({ email: user.email });
    if (checkEmail) {
      return {
        EC: 1,
        EM: "Email already exists",
        data: null
      }
    } else {
      await this.UserRepo.save(user);
      return {
        EC: 0,
        EM: "User created successfully",
        data: user
      }
    }
  }

  async findAllUsers() {
    const userInfo = await this.UserRepo.find();
    if (userInfo.length === 0) {
      return {
        message: "User not found",
        data: null
      };
    }
    return {
      message: "User found",
      data: userInfo
    };
  }

  async findUserById(userId: string) {
    const user = await this.UserRepo.findOneBy({ userId: userId });
    if (!user) {
      return {
        EC: 1,
        EM: "User not found",
        data: null
      }
    }
    return {
      EC: 0,
      EM: "User found",
      DT: user
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.UserRepo.findOneBy({ userId: userId });
    if (!user) {
      return "User not found";
    }
    return await this.UserRepo.update(userId, {
      name: updateUserDto.fullName,
      email: updateUserDto.email,
      password: updateUserDto.password,
      phoneNumber: updateUserDto.phoneNumber,
      avatarPath: updateUserDto.avatarPath,
      avatarUrl: updateUserDto.avatarUrl,
      isActive: updateUserDto.isActive,
    });
  }

  async deleteUser(userId: string) {
    return await this.UserRepo.delete(userId);
  }
}
