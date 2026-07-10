# ADR-002: Database

## Status
Accepted

## Context
We need a database for storing:
- Case decisions (10,000+ records)
- User data (profiles, saved cases, notes)
- Document chunks for RAG
- Vector embeddings

## Decision
Use PostgreSQL with Supabase.

## Rationale
- **ACID compliance**: Critical for legal data integrity
- **Full-text search**: Native tsvector for Indonesian text
- **Vector extension**: pgvector for embedding similarity search
- **Row Level Security**: Fine-grained access control
- **Managed service**: Supabase handles backups, scaling, and auth
- **Prisma support**: Excellent ORM with type-safe queries

## Consequences
- Requires PostgreSQL in development (Supabase CLI or Docker)
- Migration complexity from SQLite
- Higher infrastructure cost than SQLite

## Alternatives Considered
- **SQLite**: Simple, but lacks vector search and concurrent writes
- **MongoDB**: Flexible schema, but lacks ACID transactions and joins
- **MySQL**: Widely used, but poorer full-text search for Indonesian

## Date
2024-01-15
