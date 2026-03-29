# Database Migration System

This project uses TypeORM for database migrations.

## Setup

1. Make sure your `.env` file contains the correct database credentials:
   ```
   DB_HOST=your_host
   DB_PORT=5432
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=your_database
   NODE_ENV=development
   ```

## Available Commands

### Using NPM Scripts (Recommended)

```bash
# Generate a new migration based on entity changes
pnpm run migration:generate MigrationName

# Create an empty migration file
pnpm run migration:create MigrationName

# Run all pending migrations
pnpm run migration:run

# Revert the last migration
pnpm run migration:revert

# Show migration status
pnpm run migration:show

# Seed database with initial data
pnpm run db:seed

# Reset database completely
pnpm run db:reset
```

### Using TypeORM CLI Directly

```bash
# Generate migration
npx typeorm migration:generate src/migrations/MigrationName -d src/config/database.config.ts

# Create migration
npx typeorm migration:create src/migrations/MigrationName

# Run migrations
npx typeorm migration:run -d src/config/database.config.ts

# Revert migration
npx typeorm migration:revert -d src/config/database.config.ts

# Show migrations
npx typeorm migration:show -d src/config/database.config.ts
```

## Migration Files

Migrations are stored in `src/migrations/` directory. Each migration file follows the naming convention:
`{timestamp}-{MigrationName}.ts`

### Example Migration Structure

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationName1710000000000 implements MigrationInterface {
  name = 'MigrationName1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migration logic here
    await queryRunner.query(`CREATE TABLE example (...)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback logic here
    await queryRunner.query(`DROP TABLE example`);
  }
}
```

## Best Practices

1. **Always test migrations** in development before running in production
2. **Use descriptive names** for migrations
3. **Include both up and down methods** for rollback capability
4. **Backup your database** before running migrations in production
5. **Run migrations in order** - never skip migrations

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Ensure `synchronize: false` in production
3. Run migrations before starting the application:
   ```bash
   pnpm run migration:run
   ```

## Troubleshooting

### Common Issues

1. **Database connection failed**: Check your `.env` file and database credentials

2. **Migration already exists**: Use a different name or timestamp

3. **TypeORM CLI not found**: Install TypeORM CLI globally

   ```bash
   npm install -g typeorm
   ```

4. **Permission issues**: Make sure you have proper database permissions

## File Structure

```
server/
├── src/
│   ├── migrations/
│   │   ├── 1710000000000-InitialMigration.ts
│   │   └── 1710000000001-AddSeedData.ts
│   └── config/
│       └── database.config.ts
├── MIGRATION_README.md
└── package.json
```
