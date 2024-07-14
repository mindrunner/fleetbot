import { MigrationInterface, QueryRunner } from 'typeorm'

export class Tips1665395111187 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "refill" ADD "tip" double precision NOT NULL DEFAULT \'0.15\'',
        )
        await queryRunner.query(
            'ALTER TABLE "wallet" ADD "tip" double precision NOT NULL DEFAULT \'0.15\'',
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "wallet" DROP COLUMN "tip"')
        await queryRunner.query('ALTER TABLE "refill" DROP COLUMN "tip"')
    }
}
