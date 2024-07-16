import { MigrationInterface, QueryRunner } from 'typeorm'

export class R4Support1681496450836 implements MigrationInterface {
    name = 'R4Support1681496450836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "transaction" ADD "originalAmount" double precision',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ADD "resource" character varying',
        )
        await queryRunner.query(
            'UPDATE "transaction" SET "originalAmount" = "amount"',
        )
        await queryRunner.query(
            'UPDATE "transaction" SET "resource" = \'ATLAS\'',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ALTER COLUMN "originalAmount" SET NOT NULL',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ALTER COLUMN "resource" SET NOT NULL',
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "transaction" DROP COLUMN "resource"',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" DROP COLUMN "originalAmount"',
        )
    }
}
