-- ============================================================================
-- Migration: 00000000000001_create_case_decisions
-- Purpose: Main case decisions table (replaces SQLite caseDecisions)
--
-- Schema notes:
--   - UUID primary key (consistent with Supabase Auth)
--   - Full-text search vector for title + content
--   - JSON fields stored as TEXT (Prisma compatibility), cast to JSONB in queries
--   - Created/updated timestamps auto-managed
--   - Row Level Security enabled
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_decisions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number     TEXT NOT NULL,
    title           TEXT NOT NULL,
    case_date       TIMESTAMP WITH TIME ZONE,
    case_type       TEXT,
    court           TEXT,
    judge_panel     TEXT,
    decision        TEXT,
    legal_basis     TEXT,
    relevant_laws   TEXT,
    case_summary    TEXT,
    full_text       TEXT NOT NULL,
    pdf_url         TEXT,
    source_url      TEXT NOT NULL,
    metadata        TEXT DEFAULT '{}',
    fts             TSVECTOR,
    embedding_vector TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Unique constraint on source_url to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_case_decisions_source_url
    ON case_decisions (source_url);

-- Index for case number lookups
CREATE INDEX IF NOT EXISTS idx_case_decisions_case_number
    ON case_decisions (case_number);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_case_decisions_case_date
    ON case_decisions (case_date);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_case_decisions_fts
    ON case_decisions USING GIN (fts);

-- Trigger to auto-update the fts vector on insert/update
CREATE OR REPLACE FUNCTION case_decisions_fts_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fts :=
        setweight(to_tsvector('indonesian', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('indonesian', coalesce(NEW.full_text, '')), 'B') ||
        setweight(to_tsvector('indonesian', coalesce(NEW.case_summary, '')), 'C') ||
        setweight(to_tsvector('indonesian', coalesce(NEW.decision, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop if exists to allow re-running
DROP TRIGGER IF EXISTS case_decisions_fts_trigger ON case_decisions;

CREATE TRIGGER case_decisions_fts_trigger
    BEFORE INSERT OR UPDATE ON case_decisions
    FOR EACH ROW
    EXECUTE FUNCTION case_decisions_fts_update();

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS case_decisions_updated_at_trigger ON case_decisions;

CREATE TRIGGER case_decisions_updated_at_trigger
    BEFORE UPDATE ON case_decisions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE case_decisions ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read (public data)
CREATE POLICY "case_decisions_read_public"
    ON case_decisions FOR SELECT
    USING (true);

-- RLS: Only authenticated users can insert/update/delete
CREATE POLICY "case_decisions_write_authenticated"
    ON case_decisions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
