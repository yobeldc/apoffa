# ADR-003: Search Backend

## Status
Accepted

## Context
Users need to search through 10,000+ Indonesian court cases with:
- Full-text search in Indonesian language
- Fuzzy matching for case numbers and names
- Filtering by court, date, case type
- Fast response times (< 200ms)

## Decision
Use PostgreSQL full-text search with GIN indexes.

## Rationale
- **Single database**: No additional infrastructure to manage
- **Indonesian language**: tsvector supports 'indonesian' dictionary
- **GIN indexes**: Fast full-text search with pg_trgm for fuzzy matching
- **Hybrid search**: Combine with vector search via pgvector
- **Supabase**: Built-in search APIs via PostgREST

## Consequences
- Search performance depends on PostgreSQL tuning
- Limited advanced features (faceted search, synonyms)
- May need dedicated search service at very large scale

## Alternatives Considered
- **Meilisearch**: Fast, typo-tolerant, but adds infrastructure
- **Elasticsearch**: Powerful, but complex and resource-heavy
- **Typesense**: Good performance, but another service to manage

## Date
2024-01-15
