import { MigrationInterface, QueryRunner } from 'typeorm'

export class DisableWallet1665620874572 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "wallet" ADD "enabled" boolean NOT NULL DEFAULT true')
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "wallet" DROP COLUMN "enabled"')
    }
}
