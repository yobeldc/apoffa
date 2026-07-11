/"use client"

import { createClient } from "@/lib/supabase/client"

/**
 * Embedding Service
 * Handles: Text embedding generation for semantic search.
 * Uses: OpenAI API for embeddings.
 *
 * Note: This is a client-side utility for preview/testing.
 * Production embeddings are generated in the Cloudflare Worker
 * using @cf/baai/bge-base-en-v1.5 for zero-cost inference.
 */

const EMBEDDING_MODEL = "text-embedding-3-small"
const EMBEDDING_DIMENSIONS = 768
const API_URL = "https://api.openai.com/v1/embeddings"

interface EmbeddingResponse {
  data: Array<{
    embedding: number[]
    index: number
    object: string
  }>
  model: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

/**
 * Generate embeddings for a text string.
 * Requires OPENAI_API_KEY to be set.
 */
export async function generateEmbedding(
  text: string,
  apiKey: string
): Promise<number[]> {
  if (!text.trim()) {
    throw new Error("Text cannot be empty")
  }

  if (!apiKey) {
    throw new Error("OpenAI API key is required")
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text.trim().slice(0, 8000),
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `Embedding API error: ${response.status} - ${error.error?.message || "Unknown error"}`
    )
  }

  const result: EmbeddingResponse = await response.json()

  if (!result.data?.[0]?.embedding) {
    throw new Error("Invalid embedding response from API")
  }

  return result.data[0].embedding
}

/**
 * Generate embeddings for multiple texts in a single batch.
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  if (texts.length === 0) return []

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: texts.map((t) => t.trim().slice(0, 8000)),
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `Embedding batch API error: ${response.status} - ${error.error?.message || "Unknown error"}`
    )
  }

  const result: EmbeddingResponse = await response.json()
  return result.data.map((d) => d.embedding)
}

/**
 * Store embedding in Supabase for a document chunk.
 */
export async function storeEmbedding(
  chunkId: string,
  embedding: number[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from("document_chunks")
    .update({ embedding })
    .eq("id", chunkId)

  if (error) {
    throw new Error(`Failed to store embedding: ${error.message}`)
  }
}
