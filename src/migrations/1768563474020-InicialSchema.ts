import { MigrationInterface, QueryRunner } from "typeorm";

export class InicialSchema1768563474020 implements MigrationInterface {
    name = 'InicialSchema1768563474020'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP CONSTRAINT "movimentacao_quantidade_minima_check"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" DROP CONSTRAINT "produtos_quantidade_minima_check"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP CONSTRAINT "movimentacao_codigo_key"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "codigo"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "numero_serie"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "quantidade_minima"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "quantidade"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "valor"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "type" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "product_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "movimented_by" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "quantity" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "product_old_quantity" integer`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "product_new_quantity" integer`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "local_storage" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "product_old_local_storage" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "appointment" text`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD CONSTRAINT "FK_fc11f583ba642110027a3124a7b" FOREIGN KEY ("product_id") REFERENCES "almoxarifado"."produtos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP CONSTRAINT "FK_fc11f583ba642110027a3124a7b"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "appointment"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "product_old_local_storage"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "local_storage"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "product_new_quantity"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "product_old_quantity"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "movimented_by"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "product_id"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "valor" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "quantidade" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "quantidade_minima" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "numero_serie" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "codigo" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD CONSTRAINT "movimentacao_codigo_key" UNIQUE ("codigo")`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "category" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."produtos" ADD CONSTRAINT "produtos_quantidade_minima_check" CHECK ((minimal_quantity >= 0))`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" ADD CONSTRAINT "movimentacao_quantidade_minima_check" CHECK ((quantidade_minima >= 0))`);
    }

}
