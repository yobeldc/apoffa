#!/usr/bin/env tsx
/**
 * Production migration script
 * Runs all pending Prisma migrations against the production database.
 */

import { execSync } from 'child_process';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'migrate-production' });

function runCommand(command: string, env: Record<string, string> = {}): string {
  log.info({ command }, 'Running command');
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result;
  } catch (error) {
    log.error({ error, command }, 'Command failed');
    throw error;
  }
}

async function main() {
  log.info('Starting production migration');

  // Verify DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  log.info({ database: process.env.DATABASE_URL.replace(/:.+@/, ':***@') }, 'Using database');

  // Run Prisma migrate deploy (for production)
  const output = runCommand('npx prisma migrate deploy');
  log.info({ output }, 'Migration output');

  // Generate Prisma client
  runCommand('npx prisma generate');
  log.info('Prisma client generated');

  // Run seed if SEED_ON_MIGRATE is set
  if (process.env.SEED_ON_MIGRATE === 'true') {
    log.info('Running seed script');
    runCommand('npx prisma db seed');
  }

  log.info('Production migration complete');
}

main().catch((error) => {
  log.fatal({ error }, 'Migration failed');
  process.exit(1);
});
