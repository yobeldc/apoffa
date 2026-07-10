// src/lib/rag/index.ts
// RAG (Retrieval Augmented Generation) index management

import { chunkByParagraphs } from './chunk';
import { generateEmbedding } from './embeddings';
import { upsertVectors, deleteVectors } from './vector-store';
import { prisma } from '../db';
import { serialize } from '../serialize';

export interface IndexResult {
  caseId: string;
  chunksIndexed: number;
  vectorIds: string[];
  error?: string;
}

export async function indexCase(caseId: string): Promise<IndexResult> {
  try {
    // Fetch case with paragraphs
    const case_ = await prisma.case.findUnique({
      where: { id: caseId },
      include: { paragraphs: true },
    });

    if (!case_) {
      throw new Error(`Case not found: ${caseId}`);
    }

    // Delete existing vectors for this case
    if (case_.vectorIds) {
      try {
        const existingIds = JSON.parse(case_.vectorIds);
        await deleteVectors(existingIds);
      } catch {
        // Ignore errors deleting old vectors
      }
    }

    // Combine all text content
    const fullText = [
      case_.title,
      case_.summary,
      case_.court,
      case_.judges,
      case_.parties,
      ...case_.paragraphs.map((p) => p.text),
    ]
      .filter(Boolean)
      .join('\n\n');

    // Chunk the text
    const chunks = chunkByParagraphs(caseId, fullText);

    // Generate embeddings and store vectors
    const vectorIds: string[] = [];

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.text);
      const vectorId = chunk.id;

      await upsertVectors([
        {
          id: vectorId,
          vector: embedding,
          metadata: {
            caseId,
            text: chunk.text,
            paragraphNumber: chunk.metadata.paragraphNumber,
          },
        },
      ]);

      vectorIds.push(vectorId);
    }

    // Update case with vector IDs
    await prisma.case.update({
      where: { id: caseId },
      data: {
        vectorIds: JSON.stringify(vectorIds),
        indexedAt: new Date(),
      },
    });

    return {
      caseId,
      chunksIndexed: chunks.length,
      vectorIds,
    };
  } catch (error) {
    return {
      caseId,
      chunksIndexed: 0,
      vectorIds: [],
      error: (error as Error).message,
    };
  }
}

export async function indexAllCases(): Promise<IndexResult[]> {
  const cases = await prisma.case.findMany({
    where: {
      OR: [{ indexedAt: null }, { indexedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }],
    },
    select: { id: true },
  });

  const results: IndexResult[] = [];

  for (const case_ of cases) {
    const result = await indexCase(case_.id);
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

export async function getIndexStatus(caseId: string) {
  const case_ = await prisma.case.findUnique({
    where: { id: caseId },
    select: { indexedAt: true, vectorIds: true },
  });

  if (!case_) return null;

  return serialize({
    isIndexed: !!case_.indexedAt,
    indexedAt: case_.indexedAt,
    vectorCount: case_.vectorIds ? JSON.parse(case_.vectorIds).length : 0,
  });
}
