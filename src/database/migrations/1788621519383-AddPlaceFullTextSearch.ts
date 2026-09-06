import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlaceFullTextSearch1788621519383 implements MigrationInterface {
  name = 'AddPlaceFullTextSearch1788621519383';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "IDX_travel_places_full_text"
      ON "travel_places"
      USING GIN (
        to_tsvector(
          'simple'::regconfig,
          coalesce("name", '') || ' ' ||
          coalesce("description", '') || ' ' ||
          coalesce("city", '') || ' ' ||
          coalesce("country", '') || ' ' ||
          coalesce("category", '')
        )
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "public"."IDX_travel_places_full_text"',
    );
  }
}
