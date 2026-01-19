import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductCreatedBy21768832821240 implements MigrationInterface {
    name = 'ProductCreatedBy21768832821240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" ALTER COLUMN "created_by" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" ALTER COLUMN "created_by" DROP NOT NULL`);
    }
}
