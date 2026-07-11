/**
 * Worker Shared Types
 * TypeScript type definitions used across the Cloudflare Worker.
 */

// ── Database Types ──────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: DocumentRow
        Insert: DocumentInsert
        Update: DocumentUpdate
      }
      document_chunks: {
        Row: DocumentChunkRow
        Insert: DocumentChunkInsert
        Update: DocumentChunkUpdate
      }
      ingestion_jobs: {
        Row: IngestionJobRow
        Insert: IngestionJobInsert
      }
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
      }
    }
  }
}

export interface DocumentRow {
  id: string
  title: string
  content: string
  content_tsvector: unknown // tsvector
  source: string
  url: string | null
  metadata: Record<string, unknown>
  tags: string[]
  category: string | null
  status: "pending" | "processing" | "indexed" | "error"
  created_at: string
  updated_at: string
  indexed_at: string | null
}

export type DocumentInsert = Omit<
  DocumentRow,
  "id" | "created_at" | "updated_at" | "indexed_at"
>

export type DocumentUpdate = Partial<
  Omit<DocumentRow, "id" | "created_at">
>

export interface DocumentChunkRow {
  id: string
  document_id: string
  content: string
  embedding: number[] | null
  metadata: Record<string, unknown>
  chunk_index: number
  source: string | null
  created_at: string
}

export type DocumentChunkInsert = Omit<
  DocumentChunkRow,
  "id" | "created_at"
>

export type DocumentChunkUpdate = Partial<
  Omit<DocumentChunkRow, "id" | "created_at">
>

export interface IngestionJobRow {
  id: string
  document_id: string | null
  status: "queued" | "processing" | "completed" | "failed"
  stage: string | null
  progress: number
  error: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export type IngestionJobInsert = Omit<
  IngestionJobRow,
  "id" | "created_at" | "started_at" | "completed_at"
>

export interface ProfileRow {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export type ProfileInsert = Omit<ProfileRow, "created_at" | "updated_at">

// ── API Types ───────────────────────────────────────────────────────

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    page: number
    perPage: number
    total: number
  }
}

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  stream?: boolean
  model?: string
  temperature?: number
  max_tokens?: number
}

export interface RAGRequest {
  query: string
  messages?: ChatMessage[]
  topK?: number
  threshold?: number
  source?: string
  stream?: boolean
}

export interface SearchRequest {
  query: string
  limit?: number
  offset?: number
  source?: string
  fuzzy?: boolean
  hybrid?: boolean
}

// ── Worker Context ──────────────────────────────────────────────────

export interface WorkerContext {
  env: {
    SUPABASE_URL: string
    SUPABASE_SERVICE_ROLE_KEY: string
    AI: Ai
  }
  logger: {
    info: (msg: string) => void
    error: (msg: string) => void
    debug: (msg: string) => void
  }
}
