-- ============================================================================
-- Migration: 00000000000005_create_saved_cases
-- Purpose: User-saved/bookmarked cases (replaces SQLite SavedCase)
--
-- Relationships:
--   - case_id → case_decisions.id
--   - user_id → auth.users.id (Supabase Auth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_cases (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id         UUID NOT NULL REFERENCES case_decisions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Prevent duplicate saves
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_cases_case_user
    ON saved_cases (case_id, user_id);

-- Index for listing a user's saved cases
CREATE INDEX IF NOT EXISTS idx_saved_cases_user_id
    ON saved_cases (user_id);

-- Enable RLS
ALTER TABLE saved_cases ENABLE ROW LEVEL SECURITY;

-- Users can only see their own saved cases
CREATE POLICY "saved_cases_select_own"
    ON saved_cases FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can only save their own cases
CREATE POLICY "saved_cases_insert_own"
    ON saved_cases FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can only delete their own saved cases
CREATE POLICY "saved_cases_delete_own"
    ON saved_cases FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
