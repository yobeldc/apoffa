-- ============================================================================
-- Migration: 00000000000011_create_case_analyses
-- Purpose: AI-generated case analyses (replaces SQLite CaseAnalysis)
--
-- Each row stores one AI analysis of a case, including:
--   - Summary, key issues, legal basis, decision rationale
--   - Judge performance analysis (for Apoffa Graph)
--   - Confidence score and model metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_analyses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id         UUID NOT NULL REFERENCES case_decisions(id) ON DELETE CASCADE,
    summary         TEXT,
    key_issues      TEXT DEFAULT '[]',
    legal_basis     TEXT DEFAULT '[]',
    decision_rationale TEXT,
    judge_analysis  TEXT DEFAULT '{}',
    confidence      REAL,
    model_version   TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- One analysis per case (can be relaxed if multiple versions needed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_case_analyses_case_id
    ON case_analyses (case_id);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS case_analyses_updated_at_trigger ON case_analyses;

CREATE TRIGGER case_analyses_updated_at_trigger
    BEFORE UPDATE ON case_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE case_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "case_analyses_read_public"
    ON case_analyses FOR SELECT
    USING (true);

CREATE POLICY "case_analyses_write_authenticated"
    ON case_analyses FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
