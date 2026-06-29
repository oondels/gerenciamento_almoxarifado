import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsTraceableToProduct1782738580259 implements MigrationInterface {
    name = 'AddIsTraceableToProduct1782738580259';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" ADD "is_traceable" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" DROP COLUMN "is_traceable"`);
    }

}
