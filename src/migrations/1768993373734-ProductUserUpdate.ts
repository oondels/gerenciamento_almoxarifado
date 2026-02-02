import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductUserUpdate1768993373734 implements MigrationInterface {
    name = 'ProductUserUpdate1768993373734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" ADD "updated_by" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" DROP COLUMN "updated_by"`);
    }

}
