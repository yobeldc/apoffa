-- ============================================================================
-- Migration: 00000000000003_create_ingestion_jobs
-- Purpose: Track document ingestion jobs (PDF import, web scraping batches)
--
-- Replaces: Ad-hoc job tracking in memory/files
-- ============================================================================

CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending',
    type            TEXT NOT NULL DEFAULT 'web_scrape',
    total_items     INTEGER NOT NULL DEFAULT 0,
    processed_items INTEGER NOT NULL DEFAULT 0,
    failed_items    INTEGER NOT NULL DEFAULT 0,
    config          TEXT DEFAULT '{}',
    log             TEXT DEFAULT '[]',
    error_message   TEXT,
    started_at      TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by      UUID REFERENCES auth.users(id)
);

-- Index for status-based querying
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status
    ON ingestion_jobs (status);

-- Index for creation date
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_created_at
    ON ingestion_jobs (created_at DESC);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS ingestion_jobs_updated_at_trigger ON ingestion_jobs;

CREATE TRIGGER ingestion_jobs_updated_at_trigger
    BEFORE UPDATE ON ingestion_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ingestion_jobs_read_authenticated"
    ON ingestion_jobs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "ingestion_jobs_write_authenticated"
    ON ingestion_jobs FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
