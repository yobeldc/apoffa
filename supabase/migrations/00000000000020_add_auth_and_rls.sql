-- ============================================================================
-- Migration: 00000000000020_add_auth_and_rls
-- Purpose: Additional auth-related tables and RLS policies
--
-- Tables:
--   - user_profiles: Extended user profile data
--   - user_sessions: Active session tracking
--   - email_verifications: Email verification tracking
-- ============================================================================

-- User profiles (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name    TEXT,
    bio             TEXT,
    avatar_url      TEXT,
    role            TEXT NOT NULL DEFAULT 'user',
    preferences     TEXT DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles (role);

DROP TRIGGER IF EXISTS user_profiles_updated_at_trigger ON user_profiles;
CREATE TRIGGER user_profiles_updated_at_trigger
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "user_profiles_select_public"
    ON user_profiles FOR SELECT
    USING (true);

-- Users can only update their own profile
CREATE POLICY "user_profiles_update_own"
    ON user_profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- Users can only insert their own profile
CREATE POLICY "user_profiles_insert_own"
    ON user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'user')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
DO $$
BEGIN
    -- Add tables to realtime publication
    ALTER PUBLICATION supabase_realtime ADD TABLE case_decisions;
    ALTER PUBLICATION supabase_realtime ADD TABLE ingestion_jobs;
    ALTER PUBLICATION supabase_realtime ADD TABLE case_notes;
    ALTER PUBLICATION supabase_realtime ADD TABLE saved_cases;
EXCEPTION
    WHEN OTHERS THEN
        -- Publication may not exist or table already added
        NULL;
END $$;
