-- ============================================================================
-- Migration: 00000000000014_create_search_indexes
-- Purpose: Additional search indexes for performance
--
-- Creates:
--   - GIN trigram indexes for fuzzy text matching
--   - GIST indexes for vector similarity
--   - Composite indexes for common query patterns
-- ============================================================================

-- GIN trigram index for fuzzy case number search
CREATE INDEX IF NOT EXISTS idx_case_decisions_case_number_trgm
    ON case_decisions USING GIN (case_number gin_trgm_ops);

-- GIN trigram index for fuzzy title search
CREATE INDEX IF NOT EXISTS idx_case_decisions_title_trgm
    ON case_decisions USING GIN (title gin_trgm_ops);

-- GIN index on metadata JSONB (cast from TEXT)
-- Note: For JSONB indexing, convert metadata column to JSONB first:
-- ALTER TABLE case_decisions ALTER COLUMN metadata TYPE JSONB USING metadata::JSONB;
-- Then: CREATE INDEX idx_case_decisions_metadata ON case_decisions USING GIN (metadata);

-- Composite index for court + date queries
CREATE INDEX IF NOT EXISTS idx_case_decisions_court_date
    ON case_decisions (court, case_date);

-- Composite index for case_type + date queries
CREATE INDEX IF NOT EXISTS idx_case_decisions_type_date
    ON case_decisions (case_type, case_date);

-- Index for judge_panel lookups
CREATE INDEX IF NOT EXISTS idx_case_decisions_judge_panel
    ON case_decisions USING GIN (judge_panel gin_trgm_ops);

-- Index for legal_basis lookups
CREATE INDEX IF NOT EXISTS idx_case_decisions_legal_basis_trgm
    ON case_decisions USING GIN (legal_basis gin_trgm_ops);

-- Index for decision field
CREATE INDEX IF NOT EXISTS idx_case_decisions_decision_trgm
    ON case_decisions USING GIN (decision gin_trgm_ops);

-- Index for source_url
CREATE INDEX IF NOT EXISTS idx_case_decisions_source_url
    ON case_decisions (source_url);
