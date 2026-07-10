#!/usr/bin/env tsx
/**
 * Bulk file import script for APOffa.
 */

import { readFile, readdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'import-files' });

function inferType(filename: string): string {
  const t: Record<string, string> = { '.txt': 'note', '.md': 'note', '.json': 'data', '.csv': 'data', '.log': 'log', '.xml': 'data', '.html': 'note', '.pdf': 'document', '.doc': 'document', '.docx': 'document' };
  return t[extname(filename).toLowerCase()] || 'document';
}

export async function importFiles(options: { caseId: string; directory: string; userId: string; recursive?: boolean }) {
  const { caseId, directory, userId, recursive = false } = options;
  log.info({ caseId, directory, recursive }, 'Starting import');

  const case_ = await prisma.case.findUnique({ where: { id: caseId } });
  if (!case_) throw new Error(`Case not found: ${caseId}`);

  const entries = await readdir(directory, { withFileTypes: true });
  let imported = 0, failed = 0;
  const errors: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory() && recursive) {
      const r = await importFiles({ caseId, directory: fullPath, userId, recursive });
      imported += r.imported; failed += r.failed; errors.push(...r.errors);
      continue;
    }
    if (!entry.isFile()) continue;
    try {
      const content = await readFile(fullPath, 'utf-8');
      await prisma.document.create({ data: { caseId, title: basename(entry.name, extname(entry.name)), content, type: inferType(entry.name), createdBy: userId } });
      imported++;
    } catch (e) {
      failed++;
      errors.push(`${entry.name}: ${e instanceof Error ? e.message : 'error'}`);
    }
  }

  await prisma.caseHistory.create({ data: { caseId, event: 'bulk_import', details: `Imported ${imported}, failed ${failed}`, createdBy: userId } });
  log.info({ imported, failed }, 'Import complete');
  return { imported, failed, errors };
}

if (require.main === module) {
  const [caseId, directory, userId] = process.argv.slice(2);
  if (!caseId || !directory || !userId) { console.error('Usage: tsx import-files.ts <caseId> <dir> <userId>'); process.exit(1); }
  importFiles({ caseId, directory, userId, recursive: process.argv.includes('--recursive') })
    .then(r => { console.log(`Done: ${r.imported} imported, ${r.failed} failed`); process.exit(r.failed > 0 ? 1 : 0); })
    .catch(e => { console.error(e); process.exit(1); });
}
