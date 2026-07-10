-- ============================================================================
-- Migration: 00000000000004_create_case_notes
-- Purpose: User-created notes on cases (replaces SQLite CaseNote)
--
-- Relationships:
--   - case_id → case_decisions.id
--   - user_id → auth.users.id (Supabase Auth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_notes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id         UUID NOT NULL REFERENCES case_decisions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Composite index for user's notes on a case
CREATE UNIQUE INDEX IF NOT EXISTS idx_case_notes_case_user
    ON case_notes (case_id, user_id);

-- Index for listing a user's notes
CREATE INDEX IF NOT EXISTS idx_case_notes_user_id
    ON case_notes (user_id);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS case_notes_updated_at_trigger ON case_notes;

CREATE TRIGGER case_notes_updated_at_trigger
    BEFORE UPDATE ON case_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notes
CREATE POLICY "case_notes_select_own"
    ON case_notes FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can only insert their own notes
CREATE POLICY "case_notes_insert_own"
    ON case_notes FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can only update their own notes
CREATE POLICY "case_notes_update_own"
    ON case_notes FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Users can only delete their own notes
CREATE POLICY "case_notes_delete_own"
    ON case_notes FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
