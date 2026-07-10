// src/lib/rag/vector-store.ts
// Vector store implementation using Upstash Redis Vector

import { env } from '../env';

interface VectorData {
  id: string;
  vector: number[];
  metadata: Record<string, unknown>;
}

function getHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${env.redisToken}`,
  };
}

export async function upsertVectors(vectors: VectorData[]): Promise<void> {
  if (!env.redisUrl || !env.redisToken) {
    throw new Error('Redis not configured');
  }

  const response = await fetch(`${env.redisUrl}/upsert`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ vectors }),
  });

  if (!response.ok) {
    throw new Error(`Vector upsert error: ${response.status} ${response.statusText}`);
  }
}

export async function queryVectors(
  vector: number[],
  topK: number = 5,
  filter?: Record<string, unknown>
): Promise<Array<{ id: string; score: number; metadata: Record<string, unknown> }>> {
  if (!env.redisUrl || !env.redisToken) {
    throw new Error('Redis not configured');
  }

  const response = await fetch(`${env.redisUrl}/query`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      vector,
      topK,
      includeMetadata: true,
      filter,
    }),
  });

  if (!response.ok) {
    throw new Error(`Vector query error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

export async function deleteVectors(ids: string[]): Promise<void> {
  if (!env.redisUrl || !env.redisToken) {
    throw new Error('Redis not configured');
  }

  const response = await fetch(`${env.redisUrl}/delete`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error(`Vector delete error: ${response.status} ${response.statusText}`);
  }
}

export async function fetchVectors(ids: string[]): Promise<VectorData[]> {
  if (!env.redisUrl || !env.redisToken) {
    throw new Error('Redis not configured');
  }

  const response = await fetch(`${env.redisUrl}/fetch`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ids, includeMetadata: true }),
  });

  if (!response.ok) {
    throw new Error(`Vector fetch error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.vectors || [];
}
