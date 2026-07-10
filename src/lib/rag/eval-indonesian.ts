/**
 * Indonesian-language RAG evaluation utilities.
 */

import { logger } from '@/lib/logger';
const log = logger.child({ module: 'rag:eval-indonesian' });

export interface EvalResult {
  query: string; relevantDocs: string[]; retrievedDocs: string[];
  precision: number; recall: number; f1Score: number; mrr: number; ndcg: number;
}

export function precisionAtK(relevant: Set<string>, retrieved: string[], k?: number): number {
  const topK = k !== undefined ? retrieved.slice(0, k) : retrieved;
  if (topK.length === 0) return 0;
  return topK.filter((d) => relevant.has(d)).length / topK.length;
}

export function recall(relevant: Set<string>, retrieved: string[]): number {
  if (relevant.size === 0) return 0;
  return retrieved.filter((d) => relevant.has(d)).length / relevant.size;
}

export function f1Score(p: number, r: number): number {
  return p + r === 0 ? 0 : (2 * p * r) / (p + r);
}

export function meanReciprocalRank(relevant: Set<string>, retrieved: string[]): number {
  for (let i = 0; i < retrieved.length; i++) if (relevant.has(retrieved[i])) return 1 / (i + 1);
  return 0;
}

export function ndcg(relevant: Set<string>, retrieved: string[], k?: number): number {
  const topK = k !== undefined ? retrieved.slice(0, k) : retrieved;
  let dcg = 0;
  for (let i = 0; i < topK.length; i++) dcg += (relevant.has(topK[i]) ? 1 : 0) / Math.log2(i + 2);
  const ideal = Math.min(relevant.size, topK.length);
  let idcg = 0;
  for (let i = 0; i < ideal; i++) idcg += 1 / Math.log2(i + 2);
  return idcg === 0 ? 0 : dcg / idcg;
}

const ID_STOPWORDS = new Set(['yang','di','ke','dari','pada','dalam','untuk','dengan','dan','atau','adalah','ini','itu','juga','sudah','akan','telah','bisa','dapat','saya','anda','kita','mereka','kami']);

export function removeStopwords(text: string): string {
  return text.toLowerCase().split(/\s+/).filter((w) => !ID_STOPWORDS.has(w)).join(' ');
}

export function stemIndonesian(word: string): string {
  for (const s of ['kan','i','an','lah','kah','pun','nya']) {
    if (word.endsWith(s) && word.length > s.length + 2) return word.slice(0, -s.length);
  }
  return word;
}

export function preprocessIndonesian(text: string): string {
  return removeStopwords(text).split(/\s+/).map(stemIndonesian).join(' ');
}

export async function runEvaluation(
  dataset: { queries: Array<{ query: string; relevantDocIds: string[] }> },
  retrieveFn: (query: string) => Promise<string[]>
) {
  log.info({ queryCount: dataset.queries.length }, 'Running evaluation');
  const results: EvalResult[] = [];
  for (const item of dataset.queries) {
    const relevant = new Set(item.relevantDocIds);
    const retrieved = await retrieveFn(item.query);
    const p = precisionAtK(relevant, retrieved);
    const r = recall(relevant, retrieved);
    results.push({ query: item.query, relevantDocs: item.relevantDocIds, retrievedDocs: retrieved,
      precision: p, recall: r, f1Score: f1Score(p, r), mrr: meanReciprocalRank(relevant, retrieved), ndcg: ndcg(relevant, retrieved) });
  }
  const n = results.length;
  const avg = { precision: results.reduce((s, r) => s + r.precision, 0) / n, recall: results.reduce((s, r) => s + r.recall, 0) / n,
    f1: results.reduce((s, r) => s + r.f1Score, 0) / n, mrr: results.reduce((s, r) => s + r.mrr, 0) / n, ndcg: results.reduce((s, r) => s + r.ndcg, 0) / n };
  log.info({ avg }, 'Evaluation complete');
  return { results, averages: avg };
}
