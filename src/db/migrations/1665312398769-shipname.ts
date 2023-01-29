import { MigrationInterface, QueryRunner } from 'typeorm'

export class Shipname1665312398769 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "ship_info" ("mint" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9a25e31a5bdbb88e239433c7898" PRIMARY KEY ("mint"))')
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "ship_info"')
    }
}
