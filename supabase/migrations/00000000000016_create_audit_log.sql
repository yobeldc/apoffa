-- ============================================================================
-- Migration: 00000000000016_create_audit_log
-- Purpose: Application audit log for security and compliance
--
-- Tracks:
--   - Data modifications (who, what, when)
--   - Auth events (login, logout, failed attempts)
--   - Admin actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,
    table_name      TEXT,
    record_id       UUID,
    old_data        TEXT,
    new_data        TEXT,
    ip_address      TEXT,
    user_agent      TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for user activity
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
    ON audit_log (user_id);

-- Index for action type
CREATE INDEX IF NOT EXISTS idx_audit_log_action
    ON audit_log (action);

-- Index for table lookups
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name
    ON audit_log (table_name);

-- Index for recent entries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
    ON audit_log (created_at DESC);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs (handled by application-level checks)
CREATE POLICY "audit_log_read_authenticated"
    ON audit_log FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "audit_log_insert_authenticated"
    ON audit_log FOR INSERT
    TO authenticated
    WITH CHECK (true);
