import { MigrationInterface, QueryRunner } from 'typeorm'

export class Balance1668120405025 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "refill" ADD "preBalance" double precision NOT NULL DEFAULT \'0\'',
        )
        await queryRunner.query(
            'ALTER TABLE "refill" ADD "postBalance" double precision NOT NULL DEFAULT \'0\'',
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "refill" DROP COLUMN "postBalance"',
        )
        await queryRunner.query('ALTER TABLE "refill" DROP COLUMN "preBalance"')
    }
}
