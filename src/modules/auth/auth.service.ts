import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ROLE_NAMES } from '../../common/constants/role.constant';
import { Role } from '../roles/entities/role.entity';
import { User } from '../user/entities/user.entity';
import { LoginAuthDto } from './dto/login.dto';
import { CreateAuthDto } from './dto/register.dto';

interface RefreshPayload {
  sub: string;
  type: 'refresh';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(dto: CreateAuthDto) {
    try {
      if (dto.email && (await this.userRepo.findOneBy({ email: dto.email })))
        return { EC: 1, EM: 'Email already exists', data: null };
      if (await this.userRepo.findOneBy({ username: dto.username }))
        return { EC: 1, EM: 'Username already exists', data: null };
      const role = await this.roleRepo.findOneBy({ roleName: ROLE_NAMES.USER });
      const user = this.userRepo.create({
        ...dto,
        role: role || undefined,
        password: await bcrypt.hash(dto.password, 10),
      });
      await this.userRepo.save(user);
      return {
        EC: 0,
        EM: 'User created successfully',
        data: this.safeUser(user),
      };
    } catch (error: unknown) {
      this.logger.error(
        `Create user failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Unable to create user',
      });
    }
  }

  async loginUser(dto: LoginAuthDto) {
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
      relations: ['role'],
    });
    if (
      !user ||
      !(await bcrypt.compare(dto.password, user.password)) ||
      !user.isActive
    )
      return {
        EC: 1,
        EM: 'Tên đăng nhập hoặc mật khẩu không đúng',
        data: null,
      };
    return {
      EC: 0,
      EM: 'User logged in successfully',
      data: await this.issueSession(user),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshPayload>(
        refreshToken,
        { secret: this.refreshSecret },
      );
      if (payload.type !== 'refresh') throw new UnauthorizedException();
      const user = await this.userRepo
        .createQueryBuilder('user')
        .addSelect('user.refreshTokenHash')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.userId = :id', { id: payload.sub })
        .getOne();
      if (
        !user?.refreshTokenHash ||
        !(await bcrypt.compare(refreshToken, user.refreshTokenHash)) ||
        !user.isActive
      )
        throw new UnauthorizedException();
      return {
        EC: 0,
        EM: 'Token refreshed',
        data: await this.issueSession(user),
      };
    } catch {
      throw new UnauthorizedException({
        EC: 1,
        EM: 'Phiên đăng nhập đã hết hạn',
      });
    }
  }

  async revoke(userId: string) {
    await this.userRepo.update(userId, { refreshTokenHash: null });
  }

  private async issueSession(user: User) {
    const accessToken = this.jwtService.sign(
      {
        sub: user.userId,
        username: user.username,
        email: user.email,
        role: user.role?.roleName,
      },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.userId, type: 'refresh' },
      { secret: this.refreshSecret, expiresIn: '7d' },
    );
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({ refreshTokenHash: user.refreshTokenHash })
      .where('userId = :id', { id: user.userId })
      .execute();
    return { user: this.safeUser(user), accessToken, refreshToken };
  }

  private safeUser(user: User) {
    const safe = { ...user } as Partial<User>;
    delete safe.password;
    delete safe.refreshTokenHash;
    return safe;
  }

  private get refreshSecret() {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      `${this.configService.get<string>('JWT_SECRET') || 'default-secret'}-refresh`
    );
  }
}
