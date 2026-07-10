/**
 * Prisma client singleton and configuration.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'prisma' });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? [{ emit: 'event', level: 'query' }, { emit: 'event', level: 'error' }]
    : [{ emit: 'event', level: 'error' }],
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: { query: string; duration: number }) => {
    log.debug({ query: e.query, ms: e.duration }, 'Query');
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function checkDatabaseHealth(): Promise<{ connected: boolean; latency: number }> {
  const start = Date.now();
  try { await prisma.$queryRaw`SELECT 1`; return { connected: true, latency: Date.now() - start }; }
  catch { return { connected: false, latency: Date.now() - start }; }
}
