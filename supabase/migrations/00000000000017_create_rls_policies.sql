-- ============================================================================
-- Migration: 00000000000017_create_rls_policies
-- Purpose: Row Level Security policies for all tables
--
-- Roles:
--   - anon: Unauthenticated users (read public data only)
--   - authenticated: Logged-in users (read + write own data)
--   - service_role: Backend services (bypass RLS)
-- ============================================================================

-- Ensure RLS is enabled on all tables
ALTER TABLE case_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovered_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunk_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE statutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners (important!)
ALTER TABLE case_decisions FORCE ROW LEVEL SECURITY;
ALTER TABLE discovered_urls FORCE ROW LEVEL SECURITY;
ALTER TABLE ingestion_jobs FORCE ROW LEVEL SECURITY;
ALTER TABLE case_notes FORCE ROW LEVEL SECURITY;
ALTER TABLE saved_cases FORCE ROW LEVEL SECURITY;
ALTER TABLE search_history FORCE ROW LEVEL SECURITY;
ALTER TABLE app_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE document_pages FORCE ROW LEVEL SECURITY;
ALTER TABLE document_chunks FORCE ROW LEVEL SECURITY;
ALTER TABLE chunk_embeddings FORCE ROW LEVEL SECURITY;
ALTER TABLE case_analyses FORCE ROW LEVEL SECURITY;
ALTER TABLE rag_query_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE judges FORCE ROW LEVEL SECURITY;
ALTER TABLE issues FORCE ROW LEVEL SECURITY;
ALTER TABLE statutes FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;

-- Grant basic permissions to anon (unauthenticated)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant sequence usage for inserts
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Allow authenticated users to use the vector type
GRANT USAGE ON TYPE vector TO authenticated;
