import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertRoleToEnum1779718129396 implements MigrationInterface {
    name = 'ConvertRoleToEnum1779718129396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."allowed_users" DROP COLUMN "role"`);
        await queryRunner.query(`CREATE TYPE "almoxarifado"."allowed_users_role_enum" AS ENUM('admin_master', 'admin', 'operator', 'intern')`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."allowed_users" ADD "role" "almoxarifado"."allowed_users_role_enum" NOT NULL DEFAULT 'operator'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."allowed_users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "almoxarifado"."allowed_users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."allowed_users" ADD "role" character varying(50) NOT NULL DEFAULT 'operator'`);
    }

}
