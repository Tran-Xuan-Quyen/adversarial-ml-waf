import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1710000000000 implements MigrationInterface {
  name = 'InitialMigration1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE roles (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE projects (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        project_name VARCHAR(255) NOT NULL,
        application_domain VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE domains (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        project_id INT,
        domain_name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE promts (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        promt_name VARCHAR(255) NOT NULL,
        project_id INT,
        promt_status INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE bot_configurations (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        promts_id INT,
        personality VARCHAR(255),
        start_suggestions TEXT,
        greeting TEXT,
        application_domains TEXT[],
        header_title VARCHAR(255),
        header_title_color VARCHAR(7),
        background_color VARCHAR(7),
        logo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE file_uploads (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        promt_id INT,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_size INT,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE user_projects (
        id SERIAL PRIMARY KEY,
        user_id INT,
        project_id INT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE users (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role_id INT,
        project_id INT,
        gender INT,
        birth TIMESTAMP,
        image VARCHAR(500),
        phone_number VARCHAR(500),
        status_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE access_logs (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id INT,
        ip_address INET NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE tokens (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id INT,
        refresh_token VARCHAR(1000) NOT NULL,
        expired_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      ALTER TABLE domains ADD CONSTRAINT fk_domains_project 
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE promts ADD CONSTRAINT fk_promts_project 
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE bot_configurations ADD CONSTRAINT fk_bot_configurations_promts 
      FOREIGN KEY (promts_id) REFERENCES promts(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE file_uploads ADD CONSTRAINT fk_file_uploads_promt 
      FOREIGN KEY (promt_id) REFERENCES promts(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE user_projects ADD CONSTRAINT fk_user_projects_user 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE user_projects ADD CONSTRAINT fk_user_projects_project 
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE users ADD CONSTRAINT fk_users_role 
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE users ADD CONSTRAINT fk_users_project 
      FOREIGN KEY (project_id) REFERENCES user_projects(id) ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE access_logs ADD CONSTRAINT fk_access_logs_user 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE tokens ADD CONSTRAINT fk_tokens_user 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE user_projects ADD CONSTRAINT unique_user_project 
      UNIQUE(user_id, project_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE tokens`);
    await queryRunner.query(`DROP TABLE access_logs`);
    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`DROP TABLE user_projects`);
    await queryRunner.query(`DROP TABLE file_uploads`);
    await queryRunner.query(`DROP TABLE bot_configurations`);
    await queryRunner.query(`DROP TABLE promts`);
    await queryRunner.query(`DROP TABLE domains`);
    await queryRunner.query(`DROP TABLE projects`);
    await queryRunner.query(`DROP TABLE roles`);
  }
}
