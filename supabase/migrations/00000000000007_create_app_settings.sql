-- ============================================================================
-- Migration: 00000000000007_create_app_settings
-- Purpose: Application key-value settings (replaces SQLite AppSettings)
--
-- Design: Single-row settings with JSON value column for flexibility.
--         Each setting has a key, value (JSON string), and description.
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_settings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key             TEXT NOT NULL UNIQUE,
    value           TEXT DEFAULT '{}',
    description     TEXT,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS app_settings_updated_at_trigger ON app_settings;

CREATE TRIGGER app_settings_updated_at_trigger
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "app_settings_read_public"
    ON app_settings FOR SELECT
    USING (true);

-- Only authenticated users can modify settings
CREATE POLICY "app_settings_write_authenticated"
    ON app_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
