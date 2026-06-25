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
    private readonly UserRepo: Repository<User>
  ) { }
  async createUser(createUserDto: CreateUserDto) {
    const user = this.UserRepo.create(createUserDto);
    user.fullName = createUserDto.fullName;
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
      data: user
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.UserRepo.findOneBy({ userId: userId });
    if (!user) {
      return {
        EC: 1,
        EM: "User not found",
        data: null
      }
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updatedUser = await this.UserRepo.merge(user, updateUserDto);
    const { password, ...newUser } = updatedUser;
    await this.UserRepo.save(updatedUser);
    return {
      EC: 0,
      EM: "User updated successfully",
      data: newUser
    }
  }

  async deleteUser(userId: string) {
    const user = await this.UserRepo.findOneBy({ userId: userId });
    if (!user) {
      return {
        EC: 1,
        EM: "User not found",
        data: null
      }
    }
    await this.UserRepo.delete(userId);
    return {
      EC: 0,
      EM: "User deleted successfully",
      data: null
    }
  }
}
