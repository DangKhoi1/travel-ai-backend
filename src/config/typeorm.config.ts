import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

export const ConfigTypeOrm = TypeOrmModule.forRootAsync({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize:
      configService.get<string>('NODE_ENV') !== 'production' &&
      configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
    migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
    migrationsRun: configService.get<string>('NODE_ENV') === 'production',
  }),
  inject: [ConfigService],
});
