// src/lib/rag/answer.ts
// RAG answer generation orchestration

import { generateEmbedding } from './embeddings';
import { queryVectors } from './vector-store';
import { generateAnswer } from './llm';

export interface RAGAnswer {
  answer: string;
  sources: Array<{
    caseId: string;
    text: string;
    score: number;
  }>;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function answerQuestion(question: string): Promise<RAGAnswer> {
  // 1. Generate embedding for the question
  const questionEmbedding = await generateEmbedding(question);

  // 2. Retrieve relevant chunks
  const results = await queryVectors(questionEmbedding, 10);

  // 3. Extract context texts
  const contextTexts = results.map((r) => r.metadata?.text as string).filter(Boolean);

  // 4. Generate answer
  const llmResponse = await generateAnswer(question, contextTexts);

  // 5. Format response with sources
  return {
    answer: llmResponse.answer,
    sources: results.map((r) => ({
      caseId: (r.metadata?.caseId as string) || 'unknown',
      text: (r.metadata?.text as string) || '',
      score: r.score,
    })),
    model: llmResponse.model,
    usage: llmResponse.usage,
  };
}

export async function answerWithStreaming(
  question: string,
  onChunk: (chunk: string) => void,
  onSources: (sources: RAGAnswer['sources']) => void
): Promise<void> {
  // 1. Generate embedding
  const questionEmbedding = await generateEmbedding(question);

  // 2. Retrieve relevant chunks
  const results = await queryVectors(questionEmbedding, 10);

  // 3. Send sources immediately
  onSources(
    results.map((r) => ({
      caseId: (r.metadata?.caseId as string) || 'unknown',
      text: (r.metadata?.text as string) || '',
      score: r.score,
    }))
  );

  // 4. Stream the answer
  const { streamAnswer } = await import('./llm');
  const contextTexts = results.map((r) => r.metadata?.text as string).filter(Boolean);
  
  await streamAnswer(question, contextTexts, onChunk);
}
