import { MigrationInterface, QueryRunner } from 'typeorm'

export class Registration1665595883444 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "wallet" ADD "nick" character varying')
        await queryRunner.query('ALTER TABLE "wallet" ADD "authed" boolean NOT NULL DEFAULT false')
        await queryRunner.query('ALTER TABLE "wallet" ADD "authTxAmount" double precision')
        await queryRunner.query('ALTER TABLE "wallet" ADD "authExpire" TIMESTAMP WITH TIME ZONE')
        await queryRunner.query('ALTER TABLE "wallet" ADD "telegramId" integer')
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "wallet" DROP COLUMN "telegramId"')
        await queryRunner.query('ALTER TABLE "wallet" DROP COLUMN "authExpire"')
        await queryRunner.query('ALTER TABLE "wallet" DROP COLUMN "authTxAmount"')
        await queryRunner.query('ALTER TABLE "wallet" DROP COLUMN "authed"')
        await queryRunner.query('ALTER TABLE "wallet" DROP COLUMN "nick"')
    }
}
