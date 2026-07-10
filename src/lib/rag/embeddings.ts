// src/lib/rag/embeddings.ts
// Embedding generation using OpenAI API

import { env } from '../env';

export interface EmbeddingVector {
  id: string;
  vector: number[];
  metadata: Record<string, unknown>;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      input: text.slice(0, 8000), // OpenAI has token limits
      model: 'text-embedding-3-small',
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function generateEmbeddings(
  texts: string[]
): Promise<EmbeddingVector[]> {
  // Process in batches of 100 to avoid rate limits
  const batchSize = 100;
  const results: EmbeddingVector[] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.openaiApiKey}`,
      },
      body: JSON.stringify({
        input: batch.map((t) => t.slice(0, 8000)),
        model: 'text-embedding-3-small',
      }),
    });

    if (!response.ok) {
      throw new Error(`Batch embedding error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    for (let j = 0; j < batch.length; j++) {
      results.push({
        id: `emb-${i + j}`,
        vector: data.data[j].embedding,
        metadata: { text: batch[j].slice(0, 100) },
      });
    }
  }

  return results;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
