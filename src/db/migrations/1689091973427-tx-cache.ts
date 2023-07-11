import { MigrationInterface, QueryRunner } from 'typeorm'

export class TxCache1689091973427 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "tx_cache" ("id" character varying NOT NULL, "tx" jsonb NOT NULL, CONSTRAINT "PK_a48880d12cdce61b512e5c20c02" PRIMARY KEY ("id"))')
        await queryRunner.query('ALTER TABLE "transaction" ALTER COLUMN "id" DROP DEFAULT')
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "transaction" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()')
        await queryRunner.query('DROP TABLE "tx_cache"')
    }
}
