-- ============================================================================
-- Migration: 00000000000022_pgmq_queues
-- Purpose: Enable pgmq extension for queue-based document ingestion
--
-- pgmq provides a lightweight message queue on PostgreSQL:
--   - Send messages to queues
--   - Read messages with visibility timeout
--   - Archive processed messages
--   - Retry failed messages
--
-- Usage:
--   SELECT pgmq.create('document_ingestion');
--   SELECT pgmq.send('document_ingestion', '{"url": "..."}'::jsonb);
--   SELECT * FROM pgmq.read('document_ingestion', 30, 1); -- 30s visibility timeout
--   SELECT pgmq.delete('document_ingestion', msg_id);
-- ============================================================================

-- Enable pgmq extension (created via supabase/config.toml)
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Create document ingestion queue
SELECT pgmq.create('document_ingestion');

-- Create case analysis queue
SELECT pgmq.create('case_analysis');

-- Create embedding generation queue
SELECT pgmq.create('embedding_generation');

-- Create export queue
SELECT pgmq.create('export_jobs');

-- Grant usage on pgmq to authenticated users
GRANT USAGE ON SCHEMA pgmq TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA pgmq TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA pgmq TO authenticated;

-- Grant execute on pgmq functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA pgmq TO authenticated;
