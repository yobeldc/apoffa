#!/usr/bin/env tsx
/**
 * Database restore script.
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'restore-database' });

function run(cmd: string): string {
  return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
}

async function main() {
  const file = process.argv[2];
  if (!file) { console.error('Usage: tsx restore-database.ts <backup-file>'); process.exit(1); }
  if (!existsSync(file)) { log.fatal('Backup not found'); process.exit(1); }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL required');

  log.info({ file }, 'Restoring');
  run(`psql "${dbUrl}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`);
  run(`psql "${dbUrl}" < "${file}"`);
  log.info('Restore complete');
}

main().catch(e => { log.fatal(e); process.exit(1); });
