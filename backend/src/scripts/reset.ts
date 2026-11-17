import { runSeed } from './seed.js';
import { db } from '../config/db.js';
import fs from 'fs';
import path from 'path';

async function resetDatabase() {
  console.log('⚠️ RESETTING DATABASE: Rolling back, running migrations, and re-seeding...');

  // Safe environment check
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ FATAL: Refusing to reset production database!');
    process.exit(1);
  }

  // 1. Rollback
  const rollbackFile = path.resolve(process.cwd(), '../database/migrations/001_initial_schema_down.sql');
  if (fs.existsSync(rollbackFile)) {
    console.log('Running rollback SQL...');
    const rollbackSql = fs.readFileSync(rollbackFile, 'utf-8');
    await db.query(rollbackSql);
  }

  // 2. Migrate
  const migrationFile = path.resolve(process.cwd(), '../database/migrations/001_initial_schema.sql');
  console.log('Running migration SQL...');
  const migrationSql = fs.readFileSync(migrationFile, 'utf-8');
  await db.query(migrationSql);

  // 3. Seed
  console.log('Running seed script...');
  await runSeed();

  console.log('✨ Database reset, migrated, and seeded successfully!');
  process.exit(0);
}

resetDatabase().catch(err => {
  console.error('Database reset failed:', err);
  process.exit(1);
});
