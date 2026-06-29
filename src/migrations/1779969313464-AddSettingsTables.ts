import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSettingsTables1779969313464 implements MigrationInterface {
    name = 'AddSettingsTables1779969313464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "almoxarifado"."storage_locations" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(255) NOT NULL, "created_by" bigint NOT NULL, "updated_by" bigint, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1f8980d88f9ebaba668dddd27cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "almoxarifado"."sectors" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(255) NOT NULL, "created_by" bigint NOT NULL, "updated_by" bigint, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_923fdda0dc12f59add7b3a1782f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "almoxarifado"."sectors"`);
        await queryRunner.query(`DROP TABLE "almoxarifado"."storage_locations"`);
    }

}
