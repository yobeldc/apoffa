-- ============================================================================
-- Migration: 00000000000018_create_storage_policies
-- Purpose: Storage bucket policies for file uploads
--
-- Buckets:
--   - documents: PDF and document uploads
--   - exports: Export files (CSV, JSON)
--   - avatars: User profile avatars
-- ============================================================================

-- Create storage buckets (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'text/plain', 'text/html']),
    ('exports', 'exports', false, 10485760, ARRAY['text/csv', 'application/json', 'application/pdf']),
    ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "documents_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');

CREATE POLICY "documents_insert_authenticated"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'documents');

CREATE POLICY "documents_delete_own"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'documents' AND owner = auth.uid());

-- Storage policies for exports bucket
CREATE POLICY "exports_select_own"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'exports' AND owner = auth.uid());

CREATE POLICY "exports_insert_authenticated"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'exports');

CREATE POLICY "exports_delete_own"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'exports' AND owner = auth.uid());

-- Storage policies for avatars bucket (public read)
CREATE POLICY "avatars_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_authenticated"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_delete_own"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'avatars' AND owner = auth.uid());
