# Apoffa

A fast, beautiful, **production-grade Indonesian legal intelligence platform** —
store, search, analyze, and **ask grounded questions** about Mahkamah Agung court
decisions, with citation-first AI, legal graph analysis, and full Indonesian
language support.

**Product**: [apoffa.com](https://apoffa.com)  
**Repository**: [github.com/yobeldc/apoffa](https://github.com/yobeldc/apoffa)

---

## Architecture

```
Cloudflare (DNS + WAF)
  → Vercel (Next.js 15, Singapore)
    → Supabase (PostgreSQL + Auth + Storage + Queues)
    → Persistent Worker (PDF/OCR/Embeddings)
```

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 App Router, React 19, TypeScript, Tailwind |
| Backend | Next.js API Routes (same-origin `/api/v1/*`) |
| Database | Supabase PostgreSQL (Singapore region) |
| Auth | Supabase Auth (email/password, magic link, OAuth) |
| Search | PostgreSQL full-text + pgvector hybrid |
| Embeddings | pgvector (HNSW index) |
| Storage | Supabase Storage (private buckets) |
| Queues | pgmq (PostgreSQL-native) |
| Worker | Persistent Docker container |
| AI | Mock / Ollama / OpenAI-compatible |

---

## Quick Start

### Prerequisites

- Node.js 22+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker (for worker)

### Local Development

```bash
# 1. Clone
git clone https://github.com/yobeldc/apoffa.git
cd apoffa

# 2. Install dependencies
npm install

# 3. Start Supabase locally
supabase start

# 4. Apply migrations
supabase db reset

# 5. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase local credentials

# 6. Generate Prisma client
npm run db:generate

# 7. Seed data (optional)
npm run db:seed

# 8. Start development server
npm run dev

# 9. Open http://localhost:3000
```

### Local Supabase Credentials

After `supabase start`, your local credentials are:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

---

## Project Structure

```
apoffa/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (/api/v1/*)
│   │   ├── apoffa-graph/      # Apoffa Graph UI
│   │   ├── ask/               # Ask Apoffa (RAG chat)
│   │   ├── cases/             # Case detail pages
│   │   ├── search/            # Search page
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── ...
│   ├── components/
│   │   ├── auth/              # Auth components (login, signup, user-nav)
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── apoffa-graph-*.tsx # Graph UI components
│   │   └── ...
│   ├── lib/
│   │   ├── supabase/          # Supabase clients (browser, server, admin)
│   │   ├── apoffa-graph/      # Graph extraction & analysis
│   │   ├── rag/               # RAG pipeline (chunk, embed, retrieve, answer)
│   │   ├── search/            # Search implementations (postgres, meili)
│   │   └── ...
│   └── middleware.ts          # Auth route protection
├── supabase/
│   ├── migrations/            # 23 SQL migrations
│   ├── config.toml           # Supabase CLI config
│   └── seed.sql              # Demo data
├── worker/                    # Persistent Docker worker
│   ├── src/
│   ├── Dockerfile
│   └── docker-compose.yml
├── prisma/
│   ├── schema.prisma          # Prisma schema (PostgreSQL)
│   └── seed.ts               # Seed script
├── docs/                      # Documentation
│   ├── SUPABASE_ARCHITECTURE.md
│   ├── DEPLOY_APOFFA.md
│   ├── SECURITY.md
│   └── ...
├── infra/
│   └── cloudflare/            # Cloudflare Terraform
└── .github/workflows/         # CI/CD
```

---

## Key Features

- **Search**: PostgreSQL full-text search + pgvector semantic search with hybrid RRF ranking
- **Ask Apoffa**: Citation-grounded RAG with abstention when evidence is insufficient
- **Apoffa Graph**: Structured legal entity extraction (judges, statutes, citations, sentencing)
- **Authentication**: Supabase Auth with role-based access (public/researcher/editor/admin)
- **Row Level Security**: 78 RLS policies across 27 tables
- **Persistent Worker**: Docker-based queue worker for PDF extraction, OCR, embeddings
- **Indonesian Language**: Optimized text search for Indonesian legal terminology

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run tests (Vitest) |
| `supabase start` | Start local Supabase |
| `supabase db reset` | Reset database with migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:seed` | Seed demo data |
| `npm run worker:build` | Build worker Docker image |
| `npm run worker:dev` | Run worker locally |

---

## Documentation

- [Architecture](docs/SUPABASE_ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOY_APOFFA.md)
- [Security](docs/SECURITY.md)
- [Cost Estimates](docs/COST_ESTIMATE.md)
- [Superseded AWS Report](docs/archive/TRANSFORMATION_REPORT_AWS_SUPERCEDED.md)

---

## License

MIT
