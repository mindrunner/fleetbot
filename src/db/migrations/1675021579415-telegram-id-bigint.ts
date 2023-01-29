import { MigrationInterface, QueryRunner } from 'typeorm'

export class TelegramIdBigint1675021579415 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "wallet" ALTER COLUMN "telegramId" SET DATA TYPE bigint')
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "wallet" ALTER COLUMN "telegramId" SET DATA TYPE integer')
    }
}
