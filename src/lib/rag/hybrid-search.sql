/**
 * Hybrid Search SQL Functions for Supabase/pgvector
 * Deploy via: Supabase SQL Editor or migrations.
 *
 * Functions:
 * 1. match_document_chunks - Pure vector similarity search
 * 2. hybrid_search_chunks - RRF fusion of vector + full-text
 * 3. hybrid_search - RRF fusion for documents table
 * 4. search_documents - Full-text search with highlighting
 *
 * Prerequisites:
 * - pgvector extension enabled
 * - pg_trgm extension enabled (for fuzzy search)
 * - document_chunks table with embedding column (vector(768))
 * - documents table with content_tsvector column
 */

-- ── Enable Extensions ───────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── Table: document_chunks ──────────────────────────────────────────

-- Note: Run this in your Supabase migration if the table doesn't exist
/*
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(768) NOT NULL,
  metadata JSONB DEFAULT '{}',
  chunk_index INTEGER NOT NULL DEFAULT 0,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_source ON document_chunks(source);
*/

-- ── Function: match_document_chunks ────────────────────────────────

/**
 * Vector similarity search using cosine distance.
 * Returns chunks ranked by similarity score.
 */
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_source text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  source TEXT,
  chunk_index INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.source,
    dc.chunk_index
  FROM document_chunks dc
  WHERE
    1 - (dc.embedding <=> query_embedding) > match_threshold
    AND (filter_source IS NULL OR dc.source = filter_source)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ── Function: hybrid_search_chunks ─────────────────────────────────

/**
 * Hybrid search combining vector similarity and full-text search.
 * Uses Reciprocal Rank Fusion (RRF) for result combination.
 *
 * Parameters:
 *   query_text: Raw search query (parsed with websearch_to_tsquery)
 *   query_embedding: Pre-computed embedding vector
 *   match_count: Number of results to return
 *   full_text_weight: Weight for FTS scores (0.0 - 1.0)
 *   semantic_weight: Weight for vector scores (0.0 - 1.0)
 *   rrff_k: RRF constant (default 60)
 *   similarity_threshold: Minimum vector similarity
 *   filter_source: Optional source filter
 */
CREATE OR REPLACE FUNCTION hybrid_search_chunks(
  query_text text,
  query_embedding vector(768),
  match_count int DEFAULT 10,
  full_text_weight float DEFAULT 0.3,
  semantic_weight float DEFAULT 0.7,
  rrff_k int DEFAULT 60,
  similarity_threshold float DEFAULT 0.5,
  filter_source text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  source TEXT,
  chunk_index INTEGER,
  combined_score FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  k CONSTANT int := rrff_k;
BEGIN
  RETURN QUERY
  WITH
  -- Semantic search results with ranking
  semantic_results AS (
    SELECT
      dc.id,
      dc.document_id,
      dc.content,
      dc.metadata,
      1 - (dc.embedding <=> query_embedding) AS similarity,
      dc.source,
      dc.chunk_index,
      row_number() OVER (ORDER BY dc.embedding <=> query_embedding) AS semantic_rank
    FROM document_chunks dc
    WHERE
      1 - (dc.embedding <=> query_embedding) > similarity_threshold
      AND (filter_source IS NULL OR dc.source = filter_source)
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  -- Full-text search results with ranking
  text_results AS (
    SELECT
      dc.id,
      dc.document_id,
      dc.content,
      dc.metadata,
      0.0 AS similarity,
      dc.source,
      dc.chunk_index,
      row_number() OVER (ORDER BY ts_rank_cd(
        to_tsvector('english', dc.content),
        websearch_to_tsquery('english', query_text)
      ) DESC) AS text_rank
    FROM document_chunks dc
    WHERE
      to_tsvector('english', dc.content) @@ websearch_to_tsquery('english', query_text)
      AND (filter_source IS NULL OR dc.source = filter_source)
    ORDER BY ts_rank_cd(
      to_tsvector('english', dc.content),
      websearch_to_tsquery('english', query_text)
    ) DESC
    LIMIT match_count * 2
  ),
  -- Combine with RRF
  combined AS (
    SELECT
      COALESCE(s.id, t.id) AS id,
      COALESCE(s.document_id, t.document_id) AS document_id,
      COALESCE(s.content, t.content) AS content,
      COALESCE(s.metadata, t.metadata) AS metadata,
      COALESCE(s.similarity, 0) AS similarity,
      COALESCE(s.source, t.source) AS source,
      COALESCE(s.chunk_index, t.chunk_index) AS chunk_index,
      -- RRF score
      COALESCE(semantic_weight / (k + s.semantic_rank), 0) +
      COALESCE(full_text_weight / (k + t.text_rank), 0) AS combined_score
    FROM semantic_results s
    FULL OUTER JOIN text_results t ON s.id = t.id
  )
  SELECT *
  FROM combined
  WHERE combined_score > 0
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- ── Function: hybrid_search (documents table) ──────────────────────

CREATE OR REPLACE FUNCTION hybrid_search(
  query_text text,
  query_embedding vector(768) DEFAULT NULL,
  match_count int DEFAULT 10,
  full_text_weight float DEFAULT 0.5,
  semantic_weight float DEFAULT 0.5,
  rrff_k int DEFAULT 60,
  include_highlights boolean DEFAULT true
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  highlight TEXT,
  rank FLOAT,
  source TEXT,
  url TEXT,
  created_at TIMESTAMPTZ,
  full_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  k CONSTANT int := rrff_k;
BEGIN
  RETURN QUERY
  WITH
  text_results AS (
    SELECT
      d.id,
      d.title,
      d.content,
      CASE WHEN include_highlights
        THEN ts_headline(
          'english',
          d.content,
          websearch_to_tsquery('english', query_text),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=10'
        )
        ELSE ''
      END AS highlight,
      ts_rank_cd(d.content_tsvector, websearch_to_tsquery('english', query_text)) AS text_rank,
      d.source,
      d.url,
      d.created_at
    FROM documents d
    WHERE d.content_tsvector @@ websearch_to_tsquery('english', query_text)
    ORDER BY text_rank DESC
    LIMIT match_count * 2
  )
  SELECT
    t.id,
    t.title,
    t.content,
    t.highlight,
    t.text_rank AS rank,
    t.source,
    t.url,
    t.created_at,
    COUNT(*) OVER() AS full_count
  FROM text_results t
  ORDER BY t.text_rank DESC
  LIMIT match_count;
END;
$$;

-- ── Function: search_documents (pure FTS) ──────────────────────────

CREATE OR REPLACE FUNCTION search_documents(
  query_text text,
  result_limit int DEFAULT 20,
  include_highlights boolean DEFAULT true
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  highlight TEXT,
  rank FLOAT,
  source TEXT,
  url TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.content,
    CASE WHEN include_highlights
      THEN ts_headline(
        'english',
        d.content,
        websearch_to_tsquery('english', query_text),
        'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=10'
      )
      ELSE ''
    END AS highlight,
    ts_rank_cd(d.content_tsvector, websearch_to_tsquery('english', query_text)) AS rank,
    d.source,
    d.url,
    d.created_at
  FROM documents d
  WHERE d.content_tsvector @@ websearch_to_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$;

-- ── Triggers: Auto-update tsvector ─────────────────────────────────

CREATE OR REPLACE FUNCTION update_content_tsvector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.content_tsvector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to documents table
-- DROP TRIGGER IF EXISTS documents_tsvector_update ON documents;
-- CREATE TRIGGER documents_tsvector_update
--   BEFORE INSERT OR UPDATE ON documents
--   FOR EACH ROW
--   EXECUTE FUNCTION update_content_tsvector();
