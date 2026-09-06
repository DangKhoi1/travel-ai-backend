import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Permission } from '../../common/decorators/permission.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { ROLE_NAMES } from '../../common/constants/role.constant';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get-all-users')
  @UseGuards(RolesGuard)
  @Roles(ROLE_NAMES.ADMIN)
  @Permission('Get All Users')
  findAllUsers() {
    return this.userService.findAllUsers();
  }

  @Get('get-user-by-id')
  @UseGuards(RolesGuard)
  @Roles(ROLE_NAMES.ADMIN)
  @Permission('Get User By Id')
  findUserById(@Query('userId') userId: string) {
    return this.userService.findUserById(userId);
  }

  @Patch('update-user')
  @UseGuards(RolesGuard)
  @Roles(ROLE_NAMES.ADMIN)
  @Permission('Update User')
  updateUser(
    @Query('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete('delete-user')
  @UseGuards(RolesGuard)
  @Roles(ROLE_NAMES.ADMIN)
  @Permission('Delete User')
  deleteUser(@Query('userId') userId: string) {
    return this.userService.deleteUser(userId);
  }

  @Get('me')
  getMe(@Request() req: { user: { userId: string } }) {
    return this.userService.findUserById(req.user.userId);
  }

  @Patch('me')
  updateMe(
    @Request() req: { user: { userId: string } },
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(req.user.userId, dto);
  }
}
