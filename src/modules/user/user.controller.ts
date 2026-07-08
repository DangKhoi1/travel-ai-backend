import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Permission } from '../../common/decorators/permission.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get-all-users')
  @Permission('Get All Users')
  findAllUsers() {
    return this.userService.findAllUsers();
  }

  @Get('get-user-by-id')
  @Permission('Get User By Id')
  findUserById(@Query('userId') userId: string) {
    return this.userService.findUserById(userId);
  }

  @Patch('update-user')
  @Permission('Update User')
  updateUser(
    @Query('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete('delete-user')
  @Permission('Delete User')
  deleteUser(@Query('userId') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
