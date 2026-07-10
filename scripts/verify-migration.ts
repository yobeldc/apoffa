#!/usr/bin/env tsx
/**
 * Migration verification script
 * Validates that all migrations have been applied correctly.
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'verify-migration' });

interface VerificationResult {
  table: string;
  exists: boolean;
  rowCount: number;
  columns: string[];
}

async function verifyTable(tableName: string): Promise<VerificationResult> {
  try {
    const tableInfo = await prisma.$queryRawUnsafe<
      Array<{ column_name: string; data_type: string }>
    >(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
      AND table_schema = 'public'
    `);

    const exists = tableInfo.length > 0;
    const columns = tableInfo.map((c) => c.column_name);

    let rowCount = 0;
    if (exists) {
      const countResult = await prisma.$queryRawUnsafe<
        Array<{ count: bigint }>
      >(`SELECT COUNT(*) as count FROM "${tableName}"`);
      rowCount = Number(countResult[0]?.count || 0);
    }

    return { table: tableName, exists, rowCount, columns };
  } catch (error) {
    log.error({ error, table: tableName }, 'Failed to verify table');
    return { table: tableName, exists: false, rowCount: 0, columns: [] };
  }
}

async function main() {
  log.info('Starting migration verification');

  const expectedTables = [
    'users', 'sessions', 'cases', 'case_history',
    'documents', 'entities', 'relationships', 'case_entities',
  ];

  const results: VerificationResult[] = [];

  for (const table of expectedTables) {
    results.push(await verifyTable(table));
  }

  const allExist = results.every((r) => r.exists);
  const existingTables = results.filter((r) => r.exists).length;

  log.info({ existingTables, total: expectedTables.length }, 'Verification complete');

  if (!allExist) {
    process.exit(1);
  }
}

main().catch((error) => {
  log.fatal({ error }, 'Verification failed');
  process.exit(1);
});
