/**
 * Memoization utilities for expensive graph operations.
 */

import { logger } from '@/lib/logger';

const log = logger.child({ module: 'apoffa-graph:memo' });

export class LRUCache<K, V> {
  private cache = new Map<K, { value: V; at: number }>();
  constructor(private maxSize = 100, private ttlMs = 5 * 60 * 1000) {}

  get(key: K): V | undefined {
    const e = this.cache.get(key);
    if (!e) return undefined;
    if (Date.now() - e.at > this.ttlMs) { this.cache.delete(key); return undefined; }
    e.at = Date.now();
    return e.value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const first = this.cache.keys().next().value;
      if (first !== undefined) this.cache.delete(first);
    }
    this.cache.set(key, { value, at: Date.now() });
  }

  delete(key: K): void { this.cache.delete(key); }
  clear(): void { this.cache.clear(); }
  get size(): number { return this.cache.size; }
}

const simCache = new LRUCache<string, number>(1000, 10 * 60 * 1000);

function pairKey(a: string, b: string): string { return a < b ? `${a}::${b}` : `${b}::${a}`; }

export function memoizedSimilarity(a: string, b: string, compute: (x: string, y: string) => number): number {
  const k = pairKey(a, b);
  const c = simCache.get(k);
  if (c !== undefined) return c;
  const v = compute(a, b);
  simCache.set(k, v);
  return v;
}

const statsCache = new LRUCache<string, unknown>(50, 30 * 1000);

export async function memoizedGraphStats<T>(caseId: string, compute: () => Promise<T>): Promise<T> {
  const c = statsCache.get(caseId) as T | undefined;
  if (c !== undefined) { log.debug({ caseId }, 'Cache hit'); return c; }
  const s = await compute();
  statsCache.set(caseId, s);
  return s;
}

export function invalidateGraphStats(caseId: string): void {
  statsCache.delete(caseId);
  log.debug({ caseId }, 'Cache invalidated');
}
