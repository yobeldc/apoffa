/**
 * pgvector-based retrieval for RAG.
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'rag:retrieve-pgvector' });

export interface RetrievalResult {
  documentId: string;
  title: string;
  content: string | null;
  score: number;
}

/**
 * Full-text search using PostgreSQL tsvector.
 */
export async function fullTextSearch(query: string, limit = 10): Promise<RetrievalResult[]> {
  log.info({ query, limit }, 'FTS search');
  const results = await prisma.$queryRawUnsafe<
    Array<{ document_id: string; title: string; content: string | null; rank: number }>
  >(`
    SELECT d.id as document_id, d.title, d.content,
      ts_rank(to_tsvector('english', COALESCE(d.title,'') || ' ' || COALESCE(d.content,'')), plainto_tsquery('english', $1)) as rank
    FROM documents d
    WHERE to_tsvector('english', COALESCE(d.title,'') || ' ' || COALESCE(d.content,'')) @@ plainto_tsquery('english', $1)
    ORDER BY rank DESC
    LIMIT $2
  `, query, limit);

  return results.map(r => ({ documentId: r.document_id, title: r.title, content: r.content, score: r.rank }));
}

/**
 * Vector similarity search using pgvector.
 */
export async function vectorSearch(embedding: number[], limit = 10): Promise<RetrievalResult[]> {
  log.info({ dim: embedding.length, limit }, 'Vector search');
  const embeddingStr = `[${embedding.join(',')}]`;

  const results = await prisma.$queryRawUnsafe<
    Array<{ document_id: string; title: string; content: string | null; similarity: number }>
  >(`
    SELECT d.id as document_id, d.title, d.content,
      (1 - (de.embedding <=> $1::vector)) as similarity
    FROM document_embeddings de
    JOIN documents d ON de.document_id = d.id
    WHERE de.embedding IS NOT NULL
    ORDER BY de.embedding <=> $1::vector
    LIMIT $2
  `, embeddingStr, limit);

  return results.map(r => ({ documentId: r.document_id, title: r.title, content: r.content, score: r.similarity }));
}

/**
 * Hybrid search combining FTS and vector similarity.
 */
export async function hybridSearch(
  query: string,
  embedding?: number[],
  ftsWeight = 0.7,
  vecWeight = 0.3,
  limit = 10
): Promise<RetrievalResult[]> {
  log.info({ query, hasEmbedding: !!embedding, limit }, 'Hybrid search');

  const embeddingStr = embedding ? `[${embedding.join(',')}]` : null;

  const results = await prisma.$queryRawUnsafe<
    Array<{ document_id: string; title: string; content: string | null; score: number }>
  >(`
    WITH fts AS (
      SELECT d.id, ts_rank(to_tsvector('english', COALESCE(d.title,'') || ' ' || COALESCE(d.content,'')), plainto_tsquery('english', $1)) as rank
      FROM documents d
      WHERE to_tsvector('english', COALESCE(d.title,'') || ' ' || COALESCE(d.content,'')) @@ plainto_tsquery('english', $1)
      LIMIT $4 * 2
    ),
    vec AS (
      SELECT de.document_id, (1 - (de.embedding <=> $2::vector)) as similarity
      FROM document_embeddings de
      WHERE $2 IS NOT NULL AND de.embedding IS NOT NULL
      LIMIT $4 * 2
    )
    SELECT COALESCE(f.id, v.document_id) as document_id, d.title, d.content,
      (COALESCE(f.rank, 0) * $3 + COALESCE(v.similarity, 0) * $5)::real as score
    FROM fts f
    FULL OUTER JOIN vec v ON f.id = v.document_id
    JOIN documents d ON d.id = COALESCE(f.id, v.document_id)
    ORDER BY score DESC
    LIMIT $4
  `, query, embeddingStr, ftsWeight, limit, vecWeight);

  return results.map(r => ({ documentId: r.document_id, title: r.title, content: r.content, score: r.score }));
}
