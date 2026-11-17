import fs from 'fs';
import path from 'path';
import { db } from '../config/db.js';

async function runRollback() {
  console.log('🔄 Rolling back database schema...');
  const rollbackFile = path.resolve(process.cwd(), '../database/migrations/001_initial_schema_down.sql');
  
  if (!fs.existsSync(rollbackFile)) {
    console.error(`Rollback file not found: ${rollbackFile}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(rollbackFile, 'utf-8');
  await db.query(sql);
  console.log('✅ Rollback completed successfully.');
  process.exit(0);
}

runRollback().catch(err => {
  console.error('Rollback failed:', err);
  process.exit(1);
});
