import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuthDto } from './dto/register.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { loginAuthDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly UserRepo: Repository<User>
  ) { }

  async createUser(createUserDto: CreateAuthDto) {
    try {

      const user = this.UserRepo.create(createUserDto);
      const checkEmail = await this.UserRepo.findOneBy({ email: user.email });
      if (checkEmail) {
        return {
          EC: 1,
          EM: "Email already exists",
          data: null
        }
      } else {
        user.password = await bcrypt.hash(user.password, 10);
        await this.UserRepo.save(user);
        const { password, ...newUser } = user;
        return {
          EC: 0,
          EM: "User created successfully",
          data: newUser
        }
      }
    } catch (error) {
      throw new InternalServerErrorException({
        EC: 1,
        EM: "Error creating user",
      })
    }
  }

  async loginUser(loginAuthDto: loginAuthDto) {
    try {

      const user = await this.UserRepo.findOneBy({ username: loginAuthDto.username });
      if (!user) {
        return {
          EC: 1,
          EM: "User not found",
          data: null
        }
      }

      const isMatch = await bcrypt.compare(loginAuthDto.password, user.password);
      if (!isMatch) {
        return {
          EC: 1,
          EM: "Password not match",
          data: null
        }
      }
      const { password, ...newUser } = user;
      return {
        EC: 0,
        EM: "User logged in successfully",
        data: newUser
      }
    } catch (error) {
      throw new InternalServerErrorException({
        EC: 1,
        EM: "Error logging in user",
      })
    }
  }

}
