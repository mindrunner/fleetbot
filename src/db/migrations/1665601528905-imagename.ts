import { MigrationInterface, QueryRunner } from 'typeorm'

export class Imagename1665601528905 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "ship_info" ADD "imageName" character varying NOT NULL')
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "ship_info" DROP COLUMN "imageName"')
    }
}
