import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoanAndRoles1779713335693 implements MigrationInterface {
    name = 'AddLoanAndRoles1779713335693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "destination_type" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "destination_value" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" ADD "loaned_quantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."allowed_users" ADD "role" character varying(50) NOT NULL DEFAULT 'operator'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."allowed_users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" DROP COLUMN "loaned_quantity"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "destination_value"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "destination_type"`);
    }

}
