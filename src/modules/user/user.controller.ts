import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('get-all-users')
  findAllUsers() {
    return this.userService.findAllUsers();
  }

  @Get('get-user-by-id')
  findUserById(@Query('userId') userId: string) {
    return this.userService.findUserById(userId);
  }

  @Patch('update-user')
  updateUser(@Query('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete('delete-user')
  deleteUser(@Query('userId') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
