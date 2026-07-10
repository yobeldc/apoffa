-- ============================================================================
-- Migration: 00000000000010_create_chunk_embeddings
-- Purpose: Vector embeddings for RAG chunks using pgvector
--
-- Design:
--   - Vector column for pgvector HNSW indexing (768-dim for BAAI/bge-m3)
--   - JSON text backup for portability
--   - One-to-one with document_chunks
-- ============================================================================

CREATE TABLE IF NOT EXISTS chunk_embeddings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chunk_id        UUID NOT NULL UNIQUE REFERENCES document_chunks(id) ON DELETE CASCADE,
    embedding       vector(768),
    embedding_json  TEXT,
    model           TEXT DEFAULT 'bge-m3',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HNSW index for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_chunk_embeddings_hnsw
    ON chunk_embeddings USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Enable RLS
ALTER TABLE chunk_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chunk_embeddings_read_public"
    ON chunk_embeddings FOR SELECT
    USING (true);

CREATE POLICY "chunk_embeddings_write_authenticated"
    ON chunk_embeddings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
