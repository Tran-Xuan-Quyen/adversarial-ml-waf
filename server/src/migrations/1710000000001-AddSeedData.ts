import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeedData1710000000001 implements MigrationInterface {
  name = 'AddSeedData1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO roles (role_name) VALUES 
      ('admin'),
      ('user'),
      ('moderator')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM roles WHERE role_name IN ('admin', 'user', 'moderator')`,
    );
  }
}
