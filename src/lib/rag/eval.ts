// src/lib/rag/eval.ts
// RAG evaluation utilities

import { answerQuestion } from './answer';

export interface EvalQuestion {
  question: string;
  expectedAnswer?: string;
  relevantCaseIds?: string[];
}

export interface EvalResult {
  question: string;
  answer: string;
  relevanceScore?: number;
  latencyMs: number;
}

export async function evaluateRAG(questions: EvalQuestion[]): Promise<EvalResult[]> {
  const results: EvalResult[] = [];

  for (const q of questions) {
    const start = Date.now();
    
    try {
      const answer = await answerQuestion(q.question);
      const latencyMs = Date.now() - start;

      results.push({
        question: q.question,
        answer: answer.answer,
        latencyMs,
      });
    } catch (error) {
      results.push({
        question: q.question,
        answer: `Error: ${(error as Error).message}`,
        latencyMs: Date.now() - start,
      });
    }
  }

  return results;
}

export function calculateMetrics(results: EvalResult[]) {
  const total = results.length;
  const avgLatency = results.reduce((sum, r) => sum + r.latencyMs, 0) / total;
  const errors = results.filter((r) => r.answer.startsWith('Error:')).length;

  return {
    total,
    avgLatencyMs: Math.round(avgLatency),
    errorRate: errors / total,
    successRate: (total - errors) / total,
  };
}
