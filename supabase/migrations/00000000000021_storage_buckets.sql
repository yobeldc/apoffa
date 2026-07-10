-- ============================================================================
-- Migration: 00000000000021_storage_buckets
-- Purpose: Additional storage buckets and configurations
--
-- Creates:
--   - case-pdfs: Storage for case decision PDFs
--   - backups: Database backup files
-- ============================================================================

-- Create case-pdfs bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'case-pdfs',
    'case-pdfs',
    true,
    104857600,
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create backups bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'backups',
    'backups',
    false,
    524288000,
    ARRAY['application/sql', 'application/gzip', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

-- Policies for case-pdfs (public read)
CREATE POLICY "case_pdfs_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'case-pdfs');

CREATE POLICY "case_pdfs_insert_authenticated"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'case-pdfs');

CREATE POLICY "case_pdfs_delete_authenticated"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'case-pdfs');

-- Policies for backups (admin only)
CREATE POLICY "backups_select_authenticated"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'backups');

CREATE POLICY "backups_insert_authenticated"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'backups');

CREATE POLICY "backups_delete_authenticated"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'backups');
