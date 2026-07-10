-- ============================================================================
-- Migration: 00000000000006_create_search_history
-- Purpose: Track user search queries (replaces SQLite search_history)
--
-- Features:
--   - Full-text search vector for query text
--   - JSON filters for structured search parameters
--   - Anonymous users supported (user_id nullable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS search_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    query           TEXT NOT NULL,
    filters         TEXT DEFAULT '{}',
    result_count    INTEGER,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for user's search history
CREATE INDEX IF NOT EXISTS idx_search_history_user_id
    ON search_history (user_id);

-- Index for recent searches
CREATE INDEX IF NOT EXISTS idx_search_history_created_at
    ON search_history (created_at DESC);

-- Full-text search on queries
CREATE INDEX IF NOT EXISTS idx_search_history_fts
    ON search_history USING GIN (to_tsvector('indonesian', query));

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own search history
CREATE POLICY "search_history_select_own"
    ON search_history FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can only insert their own search history
CREATE POLICY "search_history_insert_own"
    ON search_history FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can only delete their own search history
CREATE POLICY "search_history_delete_own"
    ON search_history FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
