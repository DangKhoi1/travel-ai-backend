import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable pgvector extension
  const dataSource = app.get(DataSource);
  await dataSource.query('CREATE EXTENSION IF NOT EXISTS vector');

  // Auto-migrate: chuyển column embedding trong vector_data từ text sang vector(1536)
  await dataSource.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vector_data' AND column_name = 'embedding'
        AND data_type = 'text'
      ) THEN
        ALTER TABLE vector_data
          ALTER COLUMN embedding TYPE vector(1536)
          USING embedding::vector;
      END IF;
    END $$;
  `);

  await app.listen(process.env.PORT ?? 8080);
}

void bootstrap();
