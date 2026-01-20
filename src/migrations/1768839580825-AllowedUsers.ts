import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowedUsers1768839580825 implements MigrationInterface {
    name = 'AllowedUsers1768839580825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "almoxarifado"."allowed_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(150) NOT NULL, "matricula" bigint NOT NULL, "rfid" bigint NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_35c7889b1bf2cee182e3be17673" UNIQUE ("username"), CONSTRAINT "PK_b2bf805db25ec806d5c1c14619d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "almoxarifado"."allowed_users"`);
    }

}
