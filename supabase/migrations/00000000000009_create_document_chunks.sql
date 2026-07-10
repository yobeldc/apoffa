-- ============================================================================
-- Migration: 00000000000009_create_document_chunks
-- Purpose: Legal-aware text chunks for RAG (replaces in-memory chunking)
--
-- Chunks are created by splitting document pages along legal section
-- boundaries (e.g., "Mengadili", "Menimbang", "Menetapkan").
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_chunks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id         UUID NOT NULL REFERENCES document_pages(id) ON DELETE CASCADE,
    source_url      TEXT NOT NULL,
    chunk_index     INTEGER NOT NULL,
    content         TEXT NOT NULL,
    section_type    TEXT,
    word_count      INTEGER,
    char_count      INTEGER,
    metadata        TEXT DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for page chunks
CREATE INDEX IF NOT EXISTS idx_document_chunks_page_id
    ON document_chunks (page_id);

-- Composite index for source_url + chunk_index
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_chunks_source_chunk
    ON document_chunks (source_url, chunk_index);

-- Enable RLS
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_chunks_read_public"
    ON document_chunks FOR SELECT
    USING (true);

CREATE POLICY "document_chunks_write_authenticated"
    ON document_chunks FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
