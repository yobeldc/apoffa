-- ============================================================================
-- Migration: 00000000000013_create_graph_tables
-- Purpose: Apoffa Graph analytics tables
--
-- Tables:
--   - judges: Judge profiles with aggregated statistics
--   - issues: Legal issue taxonomy with frequency counts
--   - statutes: Referenced statutes with usage statistics
-- ============================================================================

-- Judges table
CREATE TABLE IF NOT EXISTS judges (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    title           TEXT,
    court           TEXT,
    case_count      INTEGER NOT NULL DEFAULT 0,
    decision_distribution TEXT DEFAULT '{}',
    avg_processing_days INTEGER,
    first_seen      TIMESTAMP WITH TIME ZONE,
    last_seen       TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_judges_name_court
    ON judges (name, court);

CREATE INDEX IF NOT EXISTS idx_judges_case_count
    ON judges (case_count DESC);

DROP TRIGGER IF EXISTS judges_updated_at_trigger ON judges;
CREATE TRIGGER judges_updated_at_trigger
    BEFORE UPDATE ON judges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "judges_read_public" ON judges FOR SELECT USING (true);
CREATE POLICY "judges_write_authenticated" ON judges FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL UNIQUE,
    category        TEXT,
    description     TEXT,
    case_count      INTEGER NOT NULL DEFAULT 0,
    parent_id       UUID REFERENCES issues(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_issues_category ON issues (category);
CREATE INDEX IF NOT EXISTS idx_issues_case_count ON issues (case_count DESC);

DROP TRIGGER IF EXISTS issues_updated_at_trigger ON issues;
CREATE TRIGGER issues_updated_at_trigger
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "issues_read_public" ON issues FOR SELECT USING (true);
CREATE POLICY "issues_write_authenticated" ON issues FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Statutes table
CREATE TABLE IF NOT EXISTS statutes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            TEXT NOT NULL,
    name            TEXT,
    description     TEXT,
    reference_count INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_statutes_code ON statutes (code);
CREATE INDEX IF NOT EXISTS idx_statutes_reference_count ON statutes (reference_count DESC);

DROP TRIGGER IF EXISTS statutes_updated_at_trigger ON statutes;
CREATE TRIGGER statutes_updated_at_trigger
    BEFORE UPDATE ON statutes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE statutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "statutes_read_public" ON statutes FOR SELECT USING (true);
CREATE POLICY "statutes_write_authenticated" ON statutes FOR ALL TO authenticated USING (true) WITH CHECK (true);
