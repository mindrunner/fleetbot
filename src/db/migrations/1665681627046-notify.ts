import { MigrationInterface, QueryRunner } from 'typeorm'

export class Notify1665681627046 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "wallet" ADD "notify" boolean NOT NULL DEFAULT true')
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "wallet" DROP COLUMN "notify"')
    }
}
