-- ============================================================================
-- Migration: 00000000000015_create_hybrid_search_function
-- Purpose: Hybrid search combining full-text + vector similarity with RRF
--
-- Functions:
--   - hybrid_search: Main search with text + optional vector
--   - text_search: Full-text search only
--   - vector_search: Vector similarity search only
-- ============================================================================

-- Full-text search function
CREATE OR REPLACE FUNCTION text_search(
    query_text TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    case_number TEXT,
    title TEXT,
    case_date TIMESTAMP WITH TIME ZONE,
    court TEXT,
    case_type TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cd.id,
        cd.case_number,
        cd.title,
        cd.case_date,
        cd.court,
        cd.case_type,
        ts_rank_cd(cd.fts, plainto_tsquery('indonesian', query_text), 32) AS rank
    FROM case_decisions cd
    WHERE cd.fts @@ plainto_tsquery('indonesian', query_text)
    ORDER BY rank DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vector search function
CREATE OR REPLACE FUNCTION vector_search(
    query_embedding vector(768),
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    chunk_id UUID,
    document_id UUID,
    content TEXT,
    similarity REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ce.id AS chunk_id,
        dc.page_id AS document_id,
        dc.content,
        1 - (ce.embedding <=> query_embedding) AS similarity
    FROM chunk_embeddings ce
    JOIN document_chunks dc ON ce.chunk_id = dc.id
    ORDER BY ce.embedding <=> query_embedding
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hybrid search with RRF fusion
CREATE OR REPLACE FUNCTION hybrid_search(
    query_text TEXT,
    query_embedding vector(768) DEFAULT NULL,
    limit_count INTEGER DEFAULT 10,
    vector_weight REAL DEFAULT 0.5
)
RETURNS TABLE (
    id UUID,
    case_number TEXT,
    title TEXT,
    case_date TIMESTAMP WITH TIME ZONE,
    court TEXT,
    case_type TEXT,
    score REAL
) AS $$
DECLARE
    text_results TABLE (id UUID, rank INTEGER);
    vector_results TABLE (id UUID, rank INTEGER);
BEGIN
    -- Get text search ranks
    CREATE TEMP TABLE text_ranks AS
    SELECT cd.id, row_number() OVER (ORDER BY ts_rank_cd(cd.fts, plainto_tsquery('indonesian', query_text), 32) DESC) AS rank
    FROM case_decisions cd
    WHERE cd.fts @@ plainto_tsquery('indonesian', query_text);

    -- If no embedding, return text results only
    IF query_embedding IS NULL THEN
        RETURN QUERY
        SELECT cd.id, cd.case_number, cd.title, cd.case_date, cd.court, cd.case_type,
               (1.0 / (1.0 + tr.rank))::REAL AS score
        FROM case_decisions cd
        JOIN text_ranks tr ON cd.id = tr.id
        ORDER BY score DESC
        LIMIT limit_count;
        DROP TABLE text_ranks;
        RETURN;
    END IF;

    -- Get vector search ranks (aggregate by case_decisions)
    CREATE TEMP TABLE vector_ranks AS
    SELECT dc.source_url::UUID AS id, row_number() OVER (ORDER BY 1 - (ce.embedding <=> query_embedding) DESC) AS rank
    FROM chunk_embeddings ce
    JOIN document_chunks dc ON ce.chunk_id = dc.id
    ORDER BY ce.embedding <=> query_embedding;

    -- RRF fusion
    RETURN QUERY
    SELECT
        cd.id,
        cd.case_number,
        cd.title,
        cd.case_date,
        cd.court,
        cd.case_type,
        (
            COALESCE((60.0 / (60.0 + tr.rank)), 0.0) * (1 - vector_weight) +
            COALESCE((60.0 / (60.0 + vr.rank)), 0.0) * vector_weight
        )::REAL AS score
    FROM case_decisions cd
    LEFT JOIN text_ranks tr ON cd.id = tr.id
    LEFT JOIN vector_ranks vr ON cd.id = vr.id
    WHERE tr.id IS NOT NULL OR vr.id IS NOT NULL
    ORDER BY score DESC
    LIMIT limit_count;

    DROP TABLE text_ranks;
    DROP TABLE vector_ranks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION text_search(TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION vector_search(vector(768), INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION hybrid_search(TEXT, vector(768), INTEGER, REAL) TO anon, authenticated;
