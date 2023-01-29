import { MigrationInterface, QueryRunner } from 'typeorm'

export class Index1665623724921 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE INDEX "IDX_1332d7bfbb2ff3d47e92d7ab49" ON "wallet" ("telegramId") ')
        await queryRunner.query('CREATE INDEX "IDX_33a938fb6968e2895273fda726" ON "wallet" ("enabled") ')
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX "public"."IDX_33a938fb6968e2895273fda726"')
        await queryRunner.query('DROP INDEX "public"."IDX_1332d7bfbb2ff3d47e92d7ab49"')
    }
}
