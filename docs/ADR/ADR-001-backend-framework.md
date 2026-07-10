# ADR-001: Backend Framework

## Status
Accepted

## Context
We need a backend framework for the Apoffa application that provides:
- API routes for case search, retrieval, and management
- Background job processing for document ingestion
- Integration with PostgreSQL (via Prisma)
- Real-time updates for ingestion jobs

## Decision
Use Next.js App Router with API Routes.

## Rationale
- **Unified codebase**: Frontend and backend share the same repository and TypeScript types
- **Server Components**: Reduce client-side JavaScript for better performance
- **Edge Runtime**: API routes can run on the edge for lower latency
- **Built-in optimizations**: Image optimization, code splitting, SSR
- **Vercel/Coolify native**: Easy deployment to both platforms

## Consequences
- Tightly coupled to React/Next.js ecosystem
- Requires careful separation of server vs client code
- Background jobs need separate worker process (Docker container)

## Alternatives Considered
- **Express.js**: Mature, but requires separate frontend build
- **Fastify**: Fast, but smaller ecosystem
- **Hono**: Lightweight, but less mature

## Date
2024-01-15
