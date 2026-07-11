/**
 * RAG Vector Retrieval
 * Handles: semantic document retrieval using pgvector (Supabase Vector).
 * Used by: RAG pipeline, chat completions, hybrid search.
 *
 * Architecture:
 * - Embedding generation via OpenAI/embedding model
 * - pgvector cosine similarity search
 * - Metadata filtering for source/type constraints
 * - Re-ranking support for result quality
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Types ───────────────────────────────────────────────────────────

export interface RetrievalResult {
  id: string
  content: string
  metadata: Record<string, any>
  similarity: number
  source: string
}

export interface RetrievalOptions {
  topK?: number
  threshold?: number
  filters?: Record<string, any>
  source?: string
  rerank?: boolean
}

export interface DocumentChunk {
  id: string
  document_id: string
  content: string
  embedding: number[]
  metadata: Record<string, any>
  chunk_index: number
  created_at: string
}

// ── Constants ───────────────────────────────────────────────────────

const DEFAULT_TOP_K = 5
const DEFAULT_THRESHOLD = 0.7
const MAX_TOP_K = 50

// ── Embedding Generation ────────────────────────────────────────────

/**
 * Generate embeddings using the Cloudflare Workers AI embedding model.
 * This runs inside the worker context.
 */
export async function generateEmbedding(
  text: string,
  env: { AI: any }
): Promise<number[]> {
  const sanitized = text.trim().substring(0, 8192) // Token limit safety

  const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [sanitized],
  })

  if (!response.data || !response.data[0]) {
    throw new Error('Failed to generate embedding')
  }

  return response.data[0] as number[]
}

/**
 * Generate embeddings using OpenAI API.
 * Fallback for non-worker contexts.
 */
export async function generateEmbeddingOpenAI(
  text: string,
  apiKey: string
): Promise<number[]> {
  const sanitized = text.trim().substring(0, 8192)

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: sanitized,
      model: 'text-embedding-3-small',
      dimensions: 768,
    }),
  })

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status}`)
  }

  const result = await response.json()
  return result.data[0].embedding as number[]
}

// ── Vector Search ───────────────────────────────────────────────────

/**
 * Semantic search using pgvector cosine similarity.
 * Queries the document_chunks table with embedding vector matching.
 */
export async function retrieveSimilar(
  queryEmbedding: number[],
  options: RetrievalOptions = {}
): Promise<RetrievalResult[]> {
  const {
    topK = DEFAULT_TOP_K,
    threshold = DEFAULT_THRESHOLD,
    filters = {},
    source,
  } = options

  const clampedTopK = Math.min(topK, MAX_TOP_K)
  const supabase = createAdminClient()

  // Build the RPC call with filters
  const rpcParams: any = {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: clampedTopK,
  }

  if (source) {
    rpcParams.filter_source = source
  }

  const { data, error } = await supabase.rpc('match_document_chunks', rpcParams)

  if (error) {
    console.error('Vector retrieval error:', error)
    throw new Error(`Retrieval failed: ${error.message}`)
  }

  if (!data) {
    return []
  }

  return data.map((row: any) => ({
    id: row.id,
    content: row.content,
    metadata: row.metadata || {},
    similarity: row.similarity,
    source: row.source || 'unknown',
  }))
}

/**
 * Retrieve documents by exact ID list.
 * Used for: reranking, context assembly, verification.
 */
export async function retrieveByIds(
  ids: string[]
): Promise<RetrievalResult[]> {
  if (ids.length === 0) return []

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('document_chunks')
    .select('*')
    .in('id', ids)

  if (error) {
    console.error('Retrieve by IDs error:', error)
    throw new Error(`Batch retrieval failed: ${error.message}`)
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    content: row.content,
    metadata: row.metadata || {},
    similarity: 1.0, // Exact match
    source: row.source || 'unknown',
  }))
}

// ── Hybrid Search Integration ───────────────────────────────────────

/**
 * Combined retrieval: semantic + full-text via hybrid_search RPC.
 * Returns documents ranked by RRF (Reciprocal Rank Fusion).
 */
export async function hybridRetrieve(
  query: string,
  queryEmbedding: number[],
  options: RetrievalOptions = {}
): Promise<RetrievalResult[]> {
  const {
    topK = DEFAULT_TOP_K,
    threshold = DEFAULT_THRESHOLD,
    source,
  } = options

  const clampedTopK = Math.min(topK, MAX_TOP_K)
  const supabase = createAdminClient()

  const rpcParams: any = {
    query_text: query,
    query_embedding: queryEmbedding,
    match_count: clampedTopK,
    full_text_weight: 0.3,
    semantic_weight: 0.7,
    rrff_k: 60,
    similarity_threshold: threshold,
  }

  if (source) {
    rpcParams.filter_source = source
  }

  const { data, error } = await supabase.rpc('hybrid_search_chunks', rpcParams)

  if (error) {
    console.error('Hybrid retrieval error:', error)
    throw new Error(`Hybrid retrieval failed: ${error.message}`)
  }

  if (!data) {
    return []
  }

  return data.map((row: any) => ({
    id: row.id,
    content: row.content,
    metadata: row.metadata || {},
    similarity: row.combined_score || row.similarity || 0,
    source: row.source || 'unknown',
  }))
}

// ── Document Management ─────────────────────────────────────────────

/**
 * Insert document chunks with embeddings into the vector store.
 * Used by: document ingestion pipeline.
 */
export async function insertDocumentChunks(
  chunks: Omit<DocumentChunk, 'id' | 'created_at'>[]
): Promise<string[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('document_chunks')
    .insert(
      chunks.map((chunk) => ({
        document_id: chunk.document_id,
        content: chunk.content,
        embedding: chunk.embedding,
        metadata: chunk.metadata,
        chunk_index: chunk.chunk_index,
      }))
    )
    .select('id')

  if (error) {
    console.error('Insert chunks error:', error)
    throw new Error(`Chunk insertion failed: ${error.message}`)
  }

  return (data || []).map((row: any) => row.id)
}

/**
 * Delete all chunks for a document.
 * Used by: document update/replace pipeline.
 */
export async function deleteDocumentChunks(
  documentId: string
): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('document_chunks')
    .delete()
    .eq('document_id', documentId)

  if (error) {
    console.error('Delete chunks error:', error)
    throw new Error(`Chunk deletion failed: ${error.message}`)
  }
}
