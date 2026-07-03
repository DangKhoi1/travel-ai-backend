import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/register.dto';
import { LoginAuthDto } from './dto/login.dto';
import { Permission } from 'src/common/decorators/permission.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @Permission("Register a user")
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.createUser(createAuthDto);
  }

  @Post('login')
  @Permission("Login user")
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.loginUser(loginAuthDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @Permission("Get user profile")
  getProfile(@Request() req) {
    return {
      EC: 0,
      EM: 'Get profile successfully',
      data: req.user,
    };
  }
}
