import { MigrationInterface, QueryRunner } from 'typeorm'

export class Init1665261222505 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE "refill" ("signature" character varying NOT NULL, "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fleet" character varying NOT NULL, "price" double precision NOT NULL, "food" integer NOT NULL, "tool" integer NOT NULL, "fuel" integer NOT NULL, "ammo" integer NOT NULL, "walletPublicKey" character varying, CONSTRAINT "PK_3e9de3152e2613e44bee3cc366a" PRIMARY KEY ("signature"))',
        )
        await queryRunner.query(
            'CREATE TABLE "transaction" ("signature" character varying NOT NULL, "time" TIMESTAMP WITH TIME ZONE NOT NULL, "amount" double precision NOT NULL, "walletPublicKey" character varying, CONSTRAINT "PK_504a5a02c8957257be1e0c49510" PRIMARY KEY ("signature"))',
        )
        await queryRunner.query(
            'CREATE TABLE "wallet" ("publicKey" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "nextRefill" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ee618336017c495b4b88f6694e3" PRIMARY KEY ("publicKey"))',
        )
        await queryRunner.query(
            'CREATE INDEX "IDX_8aacaefa0dd21764082066fb86" ON "wallet" ("nextRefill") ',
        )
        await queryRunner.query(
            'ALTER TABLE "refill" ADD CONSTRAINT "FK_13d26ed77e9d9fd183eceb62599" FOREIGN KEY ("walletPublicKey") REFERENCES "wallet"("publicKey") ON DELETE CASCADE ON UPDATE NO ACTION',
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
            'ALTER TABLE "refill" DROP CONSTRAINT "FK_13d26ed77e9d9fd183eceb62599"',
        )
        await queryRunner.query(
            'DROP INDEX "public"."IDX_8aacaefa0dd21764082066fb86"',
        )
        await queryRunner.query('DROP TABLE "wallet"')
        await queryRunner.query('DROP TABLE "transaction"')
        await queryRunner.query('DROP TABLE "refill"')
    }
}
