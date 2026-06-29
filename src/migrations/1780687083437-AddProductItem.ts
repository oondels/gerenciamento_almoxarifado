import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductItem1780687083437 implements MigrationInterface {
    name = 'AddProductItem1780687083437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "almoxarifado"."product_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "patrimonio" character varying(50), "serial_number" character varying(100), "status" character varying(50) NOT NULL DEFAULT 'AVAILABLE', "current_owner" character varying(255), "condition" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c2151f4c61525f72bc3c3323c6d" UNIQUE ("patrimonio"), CONSTRAINT "PK_83c3b7a80f6fe1d5ad7fa05a2a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "almoxarifado"."product_item" ADD CONSTRAINT "FK_88ef002ea2f04e6bf896da91692" FOREIGN KEY ("product_id") REFERENCES "almoxarifado"."produtos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."product_item" DROP CONSTRAINT "FK_88ef002ea2f04e6bf896da91692"`);
        await queryRunner.query(`DROP TABLE "almoxarifado"."product_item"`);
    }

}
