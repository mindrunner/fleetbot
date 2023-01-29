import { MigrationInterface, QueryRunner } from 'typeorm'

export class Refill1665312398768 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "refill" DROP CONSTRAINT "FK_13d26ed77e9d9fd183eceb62599"')
        await queryRunner.query('ALTER TABLE "refill" ALTER COLUMN "walletPublicKey" SET NOT NULL')
        await queryRunner.query('ALTER TABLE "refill" ADD CONSTRAINT "FK_13d26ed77e9d9fd183eceb62599" FOREIGN KEY ("walletPublicKey") REFERENCES "wallet"("publicKey") ON DELETE CASCADE ON UPDATE NO ACTION')
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "refill" DROP CONSTRAINT "FK_13d26ed77e9d9fd183eceb62599"')
        await queryRunner.query('ALTER TABLE "refill" ALTER COLUMN "walletPublicKey" DROP NOT NULL')
        await queryRunner.query('ALTER TABLE "refill" ADD CONSTRAINT "FK_13d26ed77e9d9fd183eceb62599" FOREIGN KEY ("walletPublicKey") REFERENCES "wallet"("publicKey") ON DELETE CASCADE ON UPDATE NO ACTION')
    }
}
