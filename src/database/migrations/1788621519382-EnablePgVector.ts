import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePgVector1788621519382 implements MigrationInterface {
  name = 'EnablePgVector1788621519382';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS vector');
    await queryRunner.query(
      'ALTER TABLE "vector_data" ALTER COLUMN "embedding" TYPE vector(1536) USING "embedding"::vector',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_vector_data_embedding_hnsw" ON "vector_data" USING hnsw ("embedding" vector_cosine_ops)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_vector_data_embedding_hnsw"',
    );
    await queryRunner.query(
      'ALTER TABLE "vector_data" ALTER COLUMN "embedding" TYPE text USING "embedding"::text',
    );
  }
}
