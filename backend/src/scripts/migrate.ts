import fs from 'fs';
import path from 'path';
import { db } from '../config/db.js';

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  const migrationsDir = path.resolve(process.cwd(), '../database/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations folder not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('_down'))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    console.log(`Executing migration: ${file}`);
    const sql = fs.readFileSync(filePath, 'utf-8');
    await db.query(sql);
    console.log(`✅ Applied ${file}`);
  }

  console.log('🎉 All migrations applied successfully!');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
