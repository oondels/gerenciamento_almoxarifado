import { MigrationInterface, QueryRunner } from "typeorm";

export class InicialSchema1768563474020 implements MigrationInterface {
    name = 'InicialSchema1768563474020'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "almoxarifado"`);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "almoxarifado"."produtos" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "name" character varying(255) NOT NULL,
                "category" character varying(100) NOT NULL,
                "codigo" character varying(50),
                "serial_number" character varying(100),
                "minimal_quantity" integer NOT NULL DEFAULT 0,
                "quantity" integer NOT NULL DEFAULT 0,
                "value" numeric(10,2),
                "local_storage" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_produtos_codigo" UNIQUE ("codigo"),
                CONSTRAINT "PK_produtos" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "almoxarifado"."movimentacao" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "type" character varying(50) NOT NULL,
                "product_id" uuid NOT NULL,
                "movimented_by" bigint NOT NULL,
                "quantity" integer NOT NULL,
                "product_old_quantity" integer,
                "product_new_quantity" integer,
                "local_storage" character varying(255),
                "product_old_local_storage" character varying(255),
                "appointment" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_movimentacao" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_movimentacao_product_id') THEN 
                    ALTER TABLE "almoxarifado"."movimentacao" 
                    ADD CONSTRAINT "FK_movimentacao_product_id" 
                    FOREIGN KEY ("product_id") REFERENCES "almoxarifado"."produtos"("id") 
                    ON DELETE NO ACTION ON UPDATE NO ACTION; 
                END IF; 
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almoxarifado"."movimentacao" DROP CONSTRAINT IF EXISTS "FK_movimentacao_product_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "almoxarifado"."movimentacao"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "almoxarifado"."produtos"`);
    }

}
