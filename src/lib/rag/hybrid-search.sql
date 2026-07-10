-- Hybrid search combining full-text and vector similarity
-- Requires: pgvector extension, tsvector columns

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Document embeddings table
CREATE TABLE IF NOT EXISTS document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    embedding VECTOR(1536),
    content_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id)
);

CREATE INDEX IF NOT EXISTS idx_doc_embeddings_vector ON document_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Full-text search helper
CREATE OR REPLACE FUNCTION document_search_fts(query_text TEXT, limit_count INT DEFAULT 10)
RETURNS TABLE (document_id UUID, rank REAL) AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, ts_rank(to_tsvector('english', COALESCE(d.title,'') || ' ' || COALESCE(d.content,'')), plainto_tsquery('english', query_text))::REAL
    FROM documents d
    WHERE to_tsvector('english', COALESCE(d.title,'') || ' ' || COALESCE(d.content,'')) @@ plainto_tsquery('english', query_text)
    ORDER BY rank DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Vector similarity helper
CREATE OR REPLACE FUNCTION document_search_vector(query_embedding VECTOR, limit_count INT DEFAULT 10)
RETURNS TABLE (document_id UUID, similarity REAL) AS $$
BEGIN
    RETURN QUERY
    SELECT de.document_id, (1 - (de.embedding <=> query_embedding))::REAL
    FROM document_embeddings de
    WHERE de.embedding IS NOT NULL
    ORDER BY de.embedding <=> query_embedding
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Hybrid search combining both
CREATE OR REPLACE FUNCTION document_search_hybrid(
    query_text TEXT,
    query_embedding VECTOR DEFAULT NULL,
    fts_weight REAL DEFAULT 0.7,
    vec_weight REAL DEFAULT 0.3,
    limit_count INT DEFAULT 10
)
RETURNS TABLE (document_id UUID, score REAL) AS $$
BEGIN
    RETURN QUERY
    WITH fts_results AS (
        SELECT * FROM document_search_fts(query_text, limit_count * 2)
    ),
    vec_results AS (
        SELECT * FROM document_search_vector(query_embedding, limit_count * 2)
        WHERE query_embedding IS NOT NULL
    ),
    combined AS (
        SELECT
            COALESCE(f.document_id, v.document_id) AS doc_id,
            COALESCE(f.rank, 0) * fts_weight +
            COALESCE(v.similarity, 0) * vec_weight AS combined_score
        FROM fts_results f
        FULL OUTER JOIN vec_results v ON f.document_id = v.document_id
    )
    SELECT c.doc_id, c.combined_score::REAL
    FROM combined c
    ORDER BY c.combined_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
