#!/usr/bin/env tsx
/**
 * Supabase migration script.
 */
import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'supabase-migrations' });

async function getMigrations(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: { name: string; path: string }[] = [];
  for (const e of entries) {
    if (e.isDirectory() && /^\d{14}_/.test(e.name)) {
      files.push({ name: e.name, path: join(dir, e.name, 'migration.sql') });
    }
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY required');
  const supabase = createClient(url, key);
  const dir = process.argv[2] || './prisma/migrations';
  const files = await getMigrations(dir);
  log.info({ count: files.length }, 'Applying migrations');
  for (const f of files) {
    const sql = await readFile(f.path, 'utf-8');
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw new Error(`${f.name}: ${error.message}`);
    log.info({ migration: f.name }, 'Applied');
  }
}

main().catch((e) => { log.fatal(e); process.exit(1); });
