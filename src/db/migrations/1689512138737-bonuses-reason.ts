import { MigrationInterface, QueryRunner } from 'typeorm'

export class BonusesReason1689512138737 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "bonus" ADD "reason" character varying NOT NULL',
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "bonus" DROP COLUMN "reason"')
    }
}
