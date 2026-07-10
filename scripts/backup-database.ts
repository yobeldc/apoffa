#!/usr/bin/env tsx
/**
 * Database backup script.
 */
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'backup-database' });

function run(cmd: string): string {
  return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL required');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.sql`;

  log.info({ filename }, 'Starting backup');
  const output = run(`pg_dump "${dbUrl}" --clean --if-exists --no-owner --no-privileges`);
  writeFileSync(filename, output);
  log.info({ filename, size: output.length }, 'Backup complete');
}

main().catch(e => { log.fatal(e); process.exit(1); });
