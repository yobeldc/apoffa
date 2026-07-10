// src/lib/rag/retrieve.ts
// Document retrieval with hybrid search

import { generateEmbedding } from './embeddings';
import { queryVectors } from './vector-store';
import { prisma } from '../db';
import { serialize } from '../serialize';

export interface RetrievedDocument {
  id: string;
  text: string;
  caseId: string;
  score: number;
  metadata: {
    title?: string;
    court?: string;
    year?: number;
    paragraphNumber?: number;
  };
}

export async function retrieveDocuments(
  query: string,
  options: {
    topK?: number;
    filters?: {
      year?: number;
      court?: string;
    };
  } = {}
): Promise<RetrievedDocument[]> {
  const { topK = 10 } = options;

  // 1. Semantic search via vector store
  const queryEmbedding = await generateEmbedding(query);
  const vectorResults = await queryVectors(queryEmbedding, topK * 2);

  // 2. Get case metadata for results
  const caseIds = [...new Set(vectorResults.map((r) => r.metadata?.caseId as string).filter(Boolean))];
  
  const cases = await prisma.case.findMany({
    where: { id: { in: caseIds } },
    select: {
      id: true,
      title: true,
      court: true,
      year: true,
    },
  });

  const caseMap = new Map(cases.map((c) => [c.id, c]));

  // 3. Combine and format results
  const documents: RetrievedDocument[] = vectorResults.map((result) => {
    const caseId = (result.metadata?.caseId as string) || 'unknown';
    const case_ = caseMap.get(caseId);

    return {
      id: result.id,
      text: (result.metadata?.text as string) || '',
      caseId,
      score: result.score,
      metadata: {
        title: case_?.title,
        court: case_?.court,
        year: case_?.year,
        paragraphNumber: result.metadata?.paragraphNumber as number,
      },
    };
  });

  // 4. Apply filters if specified
  let filtered = documents;
  if (options.filters?.year) {
    filtered = filtered.filter((d) => d.metadata.year === options.filters!.year);
  }
  if (options.filters?.court) {
    filtered = filtered.filter((d) => 
      d.metadata.court?.toLowerCase().includes(options.filters!.court!.toLowerCase())
    );
  }

  // 5. Return topK results
  return filtered.slice(0, topK);
}

export async function retrieveForCase(
  caseId: string,
  query: string,
  topK: number = 5
): Promise<RetrievedDocument[]> {
  // Retrieve chunks specifically from one case
  const queryEmbedding = await generateEmbedding(query);
  const results = await queryVectors(queryEmbedding, topK * 3, { caseId });

  const case_ = await prisma.case.findUnique({
    where: { id: caseId },
    select: { title: true, court: true, year: true },
  });

  return results.map((r) => ({
    id: r.id,
    text: (r.metadata?.text as string) || '',
    caseId,
    score: r.score,
    metadata: {
      title: case_?.title,
      court: case_?.court,
      year: case_?.year,
      paragraphNumber: r.metadata?.paragraphNumber as number,
    },
  }));
}
