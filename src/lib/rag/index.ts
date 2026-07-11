/"use server"

/**
 * RAG (Retrieval-Augmented Generation) Pipeline
 * Handles: Document retrieval + LLM generation for legal Q&A.
 */

import { retrieveSimilar, hybridRetrieve } from "./retrieve-pgvector"

export * from "./retrieve-pgvector"

export interface RAGOptions {
  query: string
  queryEmbedding: number[]
  topK?: number
  threshold?: number
  source?: string
  useHybrid?: boolean
  systemPrompt?: string
}

export interface RAGResult {
  answer: string
  sources: Array<{
    id: string
    content: string
    similarity: number
    source: string
  }>
  processingTime: number
}

/**
 * Execute the RAG pipeline.
 * 1. Retrieve relevant documents
 * 2. Build context from retrieved chunks
 * 3. Generate answer with LLM
 */
export async function executeRAG(options: RAGOptions): Promise<RAGResult> {
  const startTime = Date.now()

  // Step 1: Retrieve documents
  const retrievalFn = options.useHybrid ? hybridRetrieve : retrieveSimilar
  const retrieved = await retrievalFn(options.queryEmbedding, {
    topK: options.topK || 5,
    threshold: options.threshold || 0.7,
    source: options.source,
  })

  // Step 2: Build context
  const context = retrieved
    .map((r, i) => `[${i + 1}] ${r.content}`)
    .join("\n\n")

  // Step 3: Generate answer (placeholder - integrate with LLM)
  const answer = `Based on the retrieved documents:\n\n${context}\n\n[Answer generation to be integrated with LLM]`

  return {
    answer,
    sources: retrieved.map((r) => ({
      id: r.id,
      content: r.content,
      similarity: r.similarity,
      source: r.source,
    })),
    processingTime: Date.now() - startTime,
  }
}
