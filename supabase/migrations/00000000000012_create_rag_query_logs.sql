-- ============================================================================
-- Migration: 00000000000012_create_rag_query_logs
-- Purpose: Audit log for RAG queries (for evaluation and monitoring)
--
-- Tracks every RAG query including:
--   - Query text and filters
--   - Retrieved chunks (references)
--   - Generated answer
--   - Latency and token usage
--   - User feedback (thumbs up/down)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rag_query_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    query           TEXT NOT NULL,
    filters         TEXT DEFAULT '{}',
    retrieved_chunks TEXT DEFAULT '[]',
    answer          TEXT,
    latency_ms      INTEGER,
    token_usage     TEXT DEFAULT '{}',
    feedback        TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for user query history
CREATE INDEX IF NOT EXISTS idx_rag_query_logs_user_id
    ON rag_query_logs (user_id);

-- Index for recent queries
CREATE INDEX IF NOT EXISTS idx_rag_query_logs_created_at
    ON rag_query_logs (created_at DESC);

-- Enable RLS
ALTER TABLE rag_query_logs ENABLE ROW LEVEL SECURITY;

-- Users can see their own query logs
CREATE POLICY "rag_query_logs_select_own"
    ON rag_query_logs FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can insert their own query logs
CREATE POLICY "rag_query_logs_insert_own"
    ON rag_query_logs FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
