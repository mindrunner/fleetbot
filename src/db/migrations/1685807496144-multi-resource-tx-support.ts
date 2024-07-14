import { MigrationInterface, QueryRunner } from 'typeorm'

export class MultiResourceTxSupport1685807496144 implements MigrationInterface {
    name = 'MultiResourceTxSupport1685807496144'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "transaction" ADD "id" uuid NOT NULL default gen_random_uuid()',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" DROP CONSTRAINT "PK_504a5a02c8957257be1e0c49510"',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ADD CONSTRAINT "PK_1607c7f366fba66c851dce79058" PRIMARY KEY ("signature", "id")',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" DROP CONSTRAINT "PK_1607c7f366fba66c851dce79058"',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ADD CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id")',
        )
        await queryRunner.query(
            'CREATE INDEX "IDX_504a5a02c8957257be1e0c4951" ON "transaction" ("signature") ',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ADD CONSTRAINT "UQ_6720d355d907ad611603f0a3dc6" UNIQUE ("signature", "resource")',
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "transaction" DROP CONSTRAINT "UQ_6720d355d907ad611603f0a3dc6"',
        )
        await queryRunner.query(
            'DROP INDEX "public"."IDX_504a5a02c8957257be1e0c4951"',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" DROP CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9"',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ADD CONSTRAINT "PK_1607c7f366fba66c851dce79058" PRIMARY KEY ("signature", "id")',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" DROP CONSTRAINT "PK_1607c7f366fba66c851dce79058"',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ADD CONSTRAINT "PK_504a5a02c8957257be1e0c49510" PRIMARY KEY ("signature")',
        )
        await queryRunner.query('ALTER TABLE "transaction" DROP COLUMN "id"')
    }
}
