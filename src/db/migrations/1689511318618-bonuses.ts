import { MigrationInterface, QueryRunner } from 'typeorm'

export class Bonuses1689511318618 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "bonus" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "time" TIMESTAMP WITH TIME ZONE NOT NULL, "amount" double precision NOT NULL, "walletPublicKey" character varying NOT NULL, CONSTRAINT "PK_885c9ca672f42874b1a5cb4d9e7" PRIMARY KEY ("id"))')
        await queryRunner.query('ALTER TABLE "bonus" ADD CONSTRAINT "FK_81fa518bdf061dcbe81b60ccb94" FOREIGN KEY ("walletPublicKey") REFERENCES "wallet"("publicKey") ON DELETE CASCADE ON UPDATE NO ACTION')
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "bonus" DROP CONSTRAINT "FK_81fa518bdf061dcbe81b60ccb94"')
        await queryRunner.query('DROP TABLE "bonus"')
    }
}
