import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { Permission } from '../../common/decorators/permission.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login.dto';
import { CreateAuthDto } from './dto/register.dto';

const REFRESH_COOKIE = 'travel_ai_refresh';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Permission('Register a user')
  register(@Body() dto: CreateAuthDto) {
    return this.authService.createUser(dto);
  }

  @Post('login')
  @Permission('Login user')
  async login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.loginUser(dto);
    if (result.data) {
      this.setRefreshCookie(response, result.data.refreshToken);
      const data = {
        user: result.data.user,
        accessToken: result.data.accessToken,
      };
      return { ...result, data };
    }
    return result;
  }

  @Post('refresh')
  async refresh(
    @Request() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refresh(
      (request.cookies?.[REFRESH_COOKIE] as string | undefined) ?? '',
    );
    this.setRefreshCookie(response, result.data.refreshToken);
    const data = {
      user: result.data.user,
      accessToken: result.data.accessToken,
    };
    return { ...result, data };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Request() req: { user: { userId: string } },
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.revoke(req.user.userId);
    response.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
    return { EC: 0, EM: 'Logged out successfully', data: null };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @Permission('Get user profile')
  getProfile(
    @Request() req: { user: { userId: string; email: string; role: string } },
  ) {
    return { EC: 0, EM: 'Get profile successfully', data: req.user };
  }

  private setRefreshCookie(response: Response, token: string) {
    response.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
