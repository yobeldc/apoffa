// src/lib/rag/rerank.ts
// Result reranking for improved RAG quality

import { cosineSimilarity } from './embeddings';

export interface RankedResult {
  id: string;
  text: string;
  score: number;
  metadata: Record<string, unknown>;
}

export function rerankResults(
  query: string,
  results: Array<{ id: string; score: number; metadata: Record<string, unknown> }>,
  queryEmbedding: number[]
): RankedResult[] {
  // Combine original vector similarity with additional signals
  const scored = results.map((r) => {
    const text = (r.metadata?.text as string) || '';
    
    // Keyword overlap score
    const keywordScore = calculateKeywordOverlap(query, text);
    
    // Recency boost (if date available)
    const recencyBoost = calculateRecencyBoost(r.metadata);
    
    // Combined score
    const combinedScore = r.score * 0.6 + keywordScore * 0.3 + recencyBoost * 0.1;
    
    return {
      id: r.id,
      text,
      score: combinedScore,
      metadata: r.metadata,
    };
  });

  // Sort by combined score
  return scored.sort((a, b) => b.score - a.score);
}

function calculateKeywordOverlap(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const textLower = text.toLowerCase();
  
  if (queryWords.length === 0) return 0;
  
  const matches = queryWords.filter((w) => textLower.includes(w)).length;
  return matches / queryWords.length;
}

function calculateRecencyBoost(metadata: Record<string, unknown>): number {
  const date = metadata?.date as string;
  if (!date) return 0.5; // Neutral if no date
  
  const caseDate = new Date(date);
  const now = new Date();
  const yearsDiff = (now.getTime() - caseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  // More recent cases get higher score
  return Math.max(0, 1 - yearsDiff / 20);
}
