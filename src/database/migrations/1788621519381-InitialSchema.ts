import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1788621519381 implements MigrationInterface {
  name = 'InitialSchema1788621519381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permissions" ("permissionId" SERIAL NOT NULL, "permissionName" character varying NOT NULL, "apiPath" character varying, "method" character varying, "module" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b4b17d691e3c22be36b2b9f355a" PRIMARY KEY ("permissionId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("roleId" SERIAL NOT NULL, "roleName" character varying NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_992f24b9d80eb1312440ca577f1" UNIQUE ("roleName"), CONSTRAINT "PK_39bf7e8af8fe54d9d1c7a8efe6f" PRIMARY KEY ("roleId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("rolePermissionId" SERIAL NOT NULL, "roleId" integer NOT NULL, "permissionId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5c561d2a785fc6447970329a2c7" PRIMARY KEY ("rolePermissionId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "vector_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "placeId" uuid NOT NULL, "embedding" text, "modelName" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8435a629778871a180714ce20a2" UNIQUE ("placeId"), CONSTRAINT "REL_8435a629778871a180714ce20a" UNIQUE ("placeId"), CONSTRAINT "PK_58acac3c20e12d09d339f33afbd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "expense_estimates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tripPlanId" uuid NOT NULL, "transportCost" double precision NOT NULL DEFAULT '0', "hotelCost" double precision NOT NULL DEFAULT '0', "foodCost" double precision NOT NULL DEFAULT '0', "ticketCost" double precision NOT NULL DEFAULT '0', "otherCost" double precision NOT NULL DEFAULT '0', "totalCost" double precision NOT NULL DEFAULT '0', CONSTRAINT "UQ_8a8bfae457e0bcb560cf75d74fa" UNIQUE ("tripPlanId"), CONSTRAINT "REL_8a8bfae457e0bcb560cf75d74f" UNIQUE ("tripPlanId"), CONSTRAINT "PK_cfb3daebb700056e73bc969057f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "trip_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "title" character varying, "budget" double precision, "days" integer, "preferences" text, "estimatedCost" double precision, "startDate" date, "endDate" date, "isPublic" boolean NOT NULL DEFAULT false, "shareToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_93c94e8f52d7d39dd5419547a14" UNIQUE ("shareToken"), CONSTRAINT "PK_f402da7eeb0ed6389ba342b03e9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "trip_place_selections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tripPlanId" uuid NOT NULL, "placeId" uuid NOT NULL, "dayNumber" integer NOT NULL, "orderIndex" integer NOT NULL, "estimatedDuration" character varying, CONSTRAINT "PK_909ab3b85656b5a4a68111706ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "favorites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "placeId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_dba7d4d08cd22a23cce6dc95d4e" UNIQUE ("userId", "placeId"), CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "travel_places" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "city" character varying, "country" character varying, "latitude" double precision, "longitude" double precision, "ticketPrice" character varying, "category" character varying, "bestSeason" character varying, "imageUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2b032931237dbee3a63b9009abb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "placeId" uuid NOT NULL, "rating" integer NOT NULL, "comment" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d72f2394be178beac0e437da2ff" UNIQUE ("userId", "placeId"), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "sessionId" character varying NOT NULL, "message" text NOT NULL, "response" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cf76a7693b0b075dd86ea05f21d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "recommendation_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "budget" double precision, "days" integer, "preferences" text, "recommendedResult" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dbcb9af993d98108f00a7caa055" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "phoneNumber" character varying, "email" character varying, "gender" character varying, "birthYear" integer, "hobbies" character varying, "password" character varying NOT NULL, "refreshTokenHash" text, "fullName" character varying, "avatar" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "roleId" integer, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_8bf09ba754322ab9c22a215c919" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("roleId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permissions"("permissionId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vector_data" ADD CONSTRAINT "FK_8435a629778871a180714ce20a2" FOREIGN KEY ("placeId") REFERENCES "travel_places"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense_estimates" ADD CONSTRAINT "FK_8a8bfae457e0bcb560cf75d74fa" FOREIGN KEY ("tripPlanId") REFERENCES "trip_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_plans" ADD CONSTRAINT "FK_b8226a48143728a2236a9e92889" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_place_selections" ADD CONSTRAINT "FK_3abfd2a47233d5a6908a098b94d" FOREIGN KEY ("tripPlanId") REFERENCES "trip_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_place_selections" ADD CONSTRAINT "FK_a46fcedbd596f7dc4933fdb292f" FOREIGN KEY ("placeId") REFERENCES "travel_places"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" ADD CONSTRAINT "FK_e747534006c6e3c2f09939da60f" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" ADD CONSTRAINT "FK_14847d4f032b371d54530c4e6f6" FOREIGN KEY ("placeId") REFERENCES "travel_places"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_67cd63ae9e37b6fa43941214a19" FOREIGN KEY ("placeId") REFERENCES "travel_places"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_history" ADD CONSTRAINT "FK_6bac64204c7b416f465e17957ed" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recommendation_requests" ADD CONSTRAINT "FK_600d530b701545edb70bb13ad4b" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("roleId") REFERENCES "roles"("roleId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42ae9e53d5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recommendation_requests" DROP CONSTRAINT "FK_600d530b701545edb70bb13ad4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_history" DROP CONSTRAINT "FK_6bac64204c7b416f465e17957ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_67cd63ae9e37b6fa43941214a19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_14847d4f032b371d54530c4e6f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_e747534006c6e3c2f09939da60f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_place_selections" DROP CONSTRAINT "FK_a46fcedbd596f7dc4933fdb292f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_place_selections" DROP CONSTRAINT "FK_3abfd2a47233d5a6908a098b94d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_plans" DROP CONSTRAINT "FK_b8226a48143728a2236a9e92889"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense_estimates" DROP CONSTRAINT "FK_8a8bfae457e0bcb560cf75d74fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vector_data" DROP CONSTRAINT "FK_8435a629778871a180714ce20a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "recommendation_requests"`);
    await queryRunner.query(`DROP TABLE "chat_history"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TABLE "travel_places"`);
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(`DROP TABLE "trip_place_selections"`);
    await queryRunner.query(`DROP TABLE "trip_plans"`);
    await queryRunner.query(`DROP TABLE "expense_estimates"`);
    await queryRunner.query(`DROP TABLE "vector_data"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
