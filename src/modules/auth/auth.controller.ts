import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/register.dto';
import { LoginAuthDto } from './dto/login.dto';
import { Permission } from 'src/common/decorators/permission.decorator';
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
}
