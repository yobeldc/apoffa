# Apoffa — Supabase Configuration

This directory contains the full Supabase setup for local development, staging, and production.

## Architecture

```
├── config.toml              # Supabase CLI local config
├── migrations/              # PostgreSQL schema migrations (20 files)
│   ├── 00000000000000_init_extensions.sql
│   ├── 00000000000001_create_case_decisions.sql
│   ├── ...
│   └── 00000000000019_create_queue_tables.sql
├── seed.sql                 # Demo data (12 cases, settings, taxonomy)
└── README.md                # This file
```

## Workflow

### 1. Start Local Supabase

```bash
# Start all services (PostgreSQL, PostgREST, Auth, Storage, Realtime, etc.)
supabase start

# Check service status
supabase status

# View service URLs and API keys
supabase status -o env
```

### 2. Reset Database (migrations + seed)

```bash
# Apply all migrations and seed data
supabase db reset

# Reset linked project (use with caution!)
supabase db reset --linked
```

### 3. Create a New Migration

```bash
# Create a new empty migration file
supabase migration new add_user_preferences

# Edit the generated file in supabase/migrations/
# Then apply:
supabase db reset
```

### 4. Apply Migrations to Staging/Production

```bash
# Link to a remote project
supabase link --project-ref <project-ref>

# Push local migrations to remote
supabase db push

# Dry run first
supabase db push --dry-run
```

### 5. Pull Remote Schema Changes

```bash
# Pull remote schema changes into a new migration
supabase db pull
```

### 6. Using Prisma with Supabase

```bash
# Generate Prisma client (after schema changes)
npx prisma generate

# Sync Prisma schema from database (if you changed migrations)
npx prisma db pull

# For seeding with Prisma
npx prisma db seed
```

## Service Ports (Local)

| Service     | Port  | URL                          |
|-------------|-------|------------------------------|
| API (REST)  | 54321 | http://localhost:54321       |
| Database    | 54322 | postgresql://localhost:54322 |
| Studio (UI) | 54323 | http://localhost:54323       |
| Inbucket    | 54324 | http://localhost:54324       |
| Storage     | 54325 | http://localhost:54325       |
| Auth        | 54326 | http://localhost:54326       |
| Realtime    | 54327 | ws://localhost:54327         |
| Analytics   | 54328 | http://localhost:54328       |

## Migrations Reference

| #  | File                                         | Description                            |
|----|---------------------------------------------|----------------------------------------|
| 00 | `00000000000000_init_extensions.sql`        | Enable pgvector, pg_trgm, unaccent     |
| 01 | `00000000000001_create_case_decisions.sql`  | Main case decisions table              |
| 02 | `00000000000002_create_discovered_urls.sql` | URL discovery queue                    |
| 03 | `00000000000003_create_ingestion_jobs.sql`  | Ingestion job tracking                 |
| 04 | `00000000000004_create_case_notes.sql`      | User notes on cases                    |
| 05 | `00000000000005_create_saved_cases.sql`     | Saved case collections                 |
| 06 | `00000000000006_create_search_history.sql`  | Search query history                   |
| 07 | `00000000000007_create_app_settings.sql`    | Key/value app settings                 |
| 08 | `00000000000008_create_document_pages.sql`  | RAG: extracted document pages          |
| 09 | `00000000000009_create_document_chunks.sql` | RAG: legal-aware text chunks           |
| 10 | `00000000000010_create_chunk_embeddings.sql`| RAG: vector embeddings (pgvector)      |
| 11 | `00000000000011_create_case_analyses.sql`   | AI case analysis                       |
| 12 | `00000000000012_create_rag_query_logs.sql`  | RAG query audit log                    |
| 13 | `00000000000013_create_graph_tables.sql`    | Apoffa Graph: judges, issues, statutes |
| 14 | `00000000000014_create_search_indexes.sql`  | GIN, GIST, HNSW indexes                |
| 15 | `00000000000015_create_hybrid_search_function.sql` | Hybrid search SQL functions   |
| 16 | `00000000000016_create_audit_log.sql`       | Application audit log                  |
| 17 | `00000000000017_create_rls_policies.sql`    | Row Level Security policies            |
| 18 | `00000000000018_create_storage_policies.sql`| Storage bucket policies                |
| 19 | `00000000000019_create_queue_tables.sql`    | Background job queue                   |

## Key Design Decisions

1. **Single schema for all environments**: No SQLite fallback. Local development uses the same PostgreSQL schema as production via `supabase start`.

2. **UUID primary keys**: All tables use `uuid_generate_v4()` for ID generation, consistent with Supabase defaults.

3. **JSON fields**: Prisma models use `String` for JSON fields (stored as JSON text). The SQL schema stores them as `TEXT` for maximum compatibility. Future migration can convert to `JSONB` for indexing.

4. **Vector embeddings**: The `chunk_embeddings` table has a `vector(768)` column for pgvector and a `vector_json` text backup. Prisma accesses vectors via raw SQL.

5. **Row Level Security**: All tables have RLS enabled with policies for `anon` (read public data) and `authenticated` (read + write) roles.

6. **Hybrid search**: Migration 15 creates functions combining full-text search (GIN) and vector similarity (HNSW) with RRF fusion.

7. **Queue system**: Migration 19 implements a lightweight job queue using `SELECT ... FOR UPDATE SKIP LOCKED` pattern, with claim/complete/fail functions.

## Testing Migrations

```bash
# Check migration status
npx tsx scripts/apply-supabase-migrations.ts --check

# Dry run
npx tsx scripts/apply-supabase-migrations.ts --dry-run

# Apply migrations (uses DATABASE_URL env var)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres npx tsx scripts/apply-supabase-migrations.ts

# Reset and reapply
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres npx tsx scripts/apply-supabase-migrations.ts --reset
```

## Troubleshooting

### Migration fails with "extension not found"
Run `supabase db reset` — extensions are enabled in migration 00.

### "relation already exists" error
Migrations are idempotent (use `IF NOT EXISTS`). If you see this, the migration order may be wrong.

### Vector search is slow
Ensure the HNSW index was created (migration 10). Check with:
```sql
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'chunk_embeddings';
```

### RLS blocking queries
Temporarily disable RLS for debugging:
```sql
ALTER TABLE case_decisions DISABLE ROW LEVEL SECURITY;
```
Remember to re-enable: `ALTER TABLE case_decisions ENABLE ROW LEVEL SECURITY;`
