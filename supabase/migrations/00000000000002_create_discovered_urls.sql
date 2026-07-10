-- ============================================================================
-- Migration: 00000000000002_create_discovered_urls
-- Purpose: URL discovery queue for web scraping
--
-- Replaces: SQLite discoveredUrl table
-- ============================================================================

CREATE TABLE IF NOT EXISTS discovered_urls (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url             TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending',
    source          TEXT,
    discovered_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    processed_at    TIMESTAMP WITH TIME ZONE,
    error_message   TEXT,
    retry_count     INTEGER NOT NULL DEFAULT 0,
    metadata        TEXT DEFAULT '{}'
);

-- Unique constraint on URL
CREATE UNIQUE INDEX IF NOT EXISTS idx_discovered_urls_url
    ON discovered_urls (url);

-- Index for status-based querying
CREATE INDEX IF NOT EXISTS idx_discovered_urls_status
    ON discovered_urls (status);

-- Index for discovery date ordering
CREATE INDEX IF NOT EXISTS idx_discovered_urls_discovered_at
    ON discovered_urls (discovered_at);

-- Enable RLS
ALTER TABLE discovered_urls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discovered_urls_read_public"
    ON discovered_urls FOR SELECT
    USING (true);

CREATE POLICY "discovered_urls_write_authenticated"
    ON discovered_urls FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
