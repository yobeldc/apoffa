-- ============================================================================
-- Migration: 00000000000008_create_document_pages
-- Purpose: Store extracted PDF pages (RAG pipeline)
--
-- Each row represents one page from a source document (PDF or web page).
-- The extraction pipeline converts PDFs → pages → chunks → embeddings.
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_pages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_url      TEXT NOT NULL,
    source_type     TEXT NOT NULL DEFAULT 'pdf',
    page_number     INTEGER NOT NULL,
    content         TEXT NOT NULL,
    word_count      INTEGER,
    char_count      INTEGER,
    metadata        TEXT DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Composite index for source_url + page_number
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_pages_source_page
    ON document_pages (source_url, page_number);

-- Enable RLS
ALTER TABLE document_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_pages_read_public"
    ON document_pages FOR SELECT
    USING (true);

CREATE POLICY "document_pages_write_authenticated"
    ON document_pages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
