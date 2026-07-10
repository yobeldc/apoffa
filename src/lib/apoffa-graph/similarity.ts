/**
 * Similarity algorithms for entity matching and deduplication.
 */

import { logger } from '@/lib/logger';
const log = logger.child({ module: 'apoffa-graph:similarity' });

export function levenshteinDistance(a: string, b: string): number {
  const m: number[][] = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] = b[i - 1] === a[j - 1] ? m[i - 1][j - 1] : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[b.length][a.length];
}

export function levenshteinSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - levenshteinDistance(a, b) / maxLen;
}

export function jaroSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const matchWindow = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  const aMatches = new Array(a.length).fill(false);
  const bMatches = new Array(b.length).fill(false);
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = bMatches[j] = true;
      matches++;
      break;
    }
  }
  if (!matches) return 0;
  let transpositions = 0, k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  return ((matches / a.length) + (matches / b.length) + ((matches - transpositions / 2) / matches)) / 3;
}

export function jaroWinklerSimilarity(a: string, b: string, scaling = 0.1): number {
  const jaro = jaroSimilarity(a, b);
  let prefix = 0;
  for (let i = 0; i < Math.min(a.length, b.length, 4); i++) {
    if (a[i] === b[i]) prefix++; else break;
  }
  return jaro + prefix * scaling * (1 - jaro);
}

export interface EntityMatch {
  entityA: string; entityB: string; similarity: number; method: string;
}

export function findDuplicates(
  entities: Array<{ id: string; name: string; type: string }>,
  threshold = 0.85
): EntityMatch[] {
  log.info({ count: entities.length, threshold }, 'Finding duplicates');
  const matches: EntityMatch[] = [];
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const a = entities[i], b = entities[j];
      if (a.type !== b.type) continue;
      const na = a.name.toLowerCase().trim(), nb = b.name.toLowerCase().trim();
      if (na === nb) continue;
      const sim = na.length <= 10 && nb.length <= 10 ? jaroWinklerSimilarity(na, nb) : levenshteinSimilarity(na, nb);
      if (sim >= threshold) matches.push({ entityA: a.id, entityB: b.id, similarity: sim, method: na.length <= 10 ? 'jaro-winkler' : 'levenshtein' });
    }
  }
  return matches.sort((a, b) => b.similarity - a.similarity);
}

export function normalizeEntityName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^a-z0-9@.\-+_]/g, '');
}
