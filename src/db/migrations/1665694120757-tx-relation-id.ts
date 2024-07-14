import { MigrationInterface, QueryRunner } from 'typeorm'

export class TxRelationId1665694120757 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "transaction" DROP CONSTRAINT "FK_0c2fe605e9898819004cd7f2113"',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ALTER COLUMN "walletPublicKey" SET NOT NULL',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ADD CONSTRAINT "FK_0c2fe605e9898819004cd7f2113" FOREIGN KEY ("walletPublicKey") REFERENCES "wallet"("publicKey") ON DELETE CASCADE ON UPDATE NO ACTION',
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "transaction" DROP CONSTRAINT "FK_0c2fe605e9898819004cd7f2113"',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ALTER COLUMN "walletPublicKey" DROP NOT NULL',
        )
        await queryRunner.query(
            'ALTER TABLE "transaction" ADD CONSTRAINT "FK_0c2fe605e9898819004cd7f2113" FOREIGN KEY ("walletPublicKey") REFERENCES "wallet"("publicKey") ON DELETE CASCADE ON UPDATE NO ACTION',
        )
    }
}
