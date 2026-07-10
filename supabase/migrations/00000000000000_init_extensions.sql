-- ============================================================================
-- Migration: 00000000000000_init_extensions
-- Purpose: Enable PostgreSQL extensions required by Apoffa
--
-- Extensions:
--   - pgvector    : Vector similarity search for RAG embeddings
--   - pg_trgm     : Trigram text similarity for fuzzy search
--   - unaccent    : Remove accents for better Indonesian text search
--   - uuid-ossp   : UUID generation (fallback if gen_random_uuid unavailable)
--   - pgcrypto    : Cryptographic functions
--   - pg_stat_statements : Query performance analysis
-- ============================================================================

-- Enable pgvector for vector embeddings (HNSW indexing)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable trigram matching for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable accent removal for normalized text search
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable cryptographic functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Add comment for schema documentation
COMMENT ON EXTENSION vector IS 'pgvector: vector similarity search for RAG embeddings (768-dim)';
COMMENT ON EXTENSION pg_trgm IS 'Trigram matching for fuzzy Indonesian text search';
