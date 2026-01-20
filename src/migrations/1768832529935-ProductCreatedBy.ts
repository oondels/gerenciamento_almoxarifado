import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductCreatedBy1768832529935 implements MigrationInterface {
    name = 'ProductCreatedBy1768832529935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" ADD "created_by" bigint NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" DROP COLUMN "created_by"`);
    }

}
