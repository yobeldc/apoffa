#!/usr/bin/env tsx
/**
 * RAG evaluation script.
 */
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'eval-rag' });

interface EvalQuery { query: string; expectedDocIds: string[]; }

function precision(relevant: Set<string>, retrieved: string[]): number {
  return retrieved.length ? retrieved.filter(d => relevant.has(d)).length / retrieved.length : 0;
}
function recall(relevant: Set<string>, retrieved: string[]): number {
  return relevant.size ? retrieved.filter(d => relevant.has(d)).length / relevant.size : 0;
}
function f1(p: number, r: number): number { return p + r === 0 ? 0 : (2 * p * r) / (p + r); }
function mrr(relevant: Set<string>, retrieved: string[]): number {
  for (let i = 0; i < retrieved.length; i++) if (relevant.has(retrieved[i])) return 1 / (i + 1);
  return 0;
}

async function main() {
  log.info('Starting RAG evaluation');
  const queries: EvalQuery[] = JSON.parse(process.argv[2] || '[]');
  if (!queries.length) { console.error('Usage: tsx eval-rag.ts \'[{"query":"...","expectedDocIds":["..."]}]\''); process.exit(1); }

  let totalP = 0, totalR = 0, totalF1 = 0, totalMrr = 0;
  for (const q of queries) {
    const relevant = new Set(q.expectedDocIds);
    const docs = await prisma.document.findMany({
      where: { OR: [{ title: { contains: q.query, mode: 'insensitive' } }, { content: { contains: q.query, mode: 'insensitive' } }] },
      take: 10,
    });
    const retrieved = docs.map(d => d.id);
    const p = precision(relevant, retrieved), r = recall(relevant, retrieved);
    totalP += p; totalR += r; totalF1 += f1(p, r); totalMrr += mrr(relevant, retrieved);
    log.info({ query: q.query, p: p.toFixed(2), r: r.toFixed(2) }, 'Query result');
  }
  const n = queries.length;
  log.info({ precision: (totalP / n).toFixed(3), recall: (totalR / n).toFixed(3), f1: (totalF1 / n).toFixed(3), mrr: (totalMrr / n).toFixed(3) }, 'Evaluation complete');
}

main().catch(e => { log.fatal(e); process.exit(1); });
