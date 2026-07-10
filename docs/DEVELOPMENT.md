# Development Guide

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/yobeldc/apoffa.git
cd apoffa

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start Supabase locally
supabase start

# 5. Run migrations
npx prisma migrate dev

# 6. Start development server
npm run dev
```

## Project Structure

```
apoffa/
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # React components
│   ├── lib/           # Utility libraries
│   │   ├── supabase/  # Supabase clients
│   │   ├── rag/       # RAG pipeline
│   │   └── apoffa-graph/ # Graph analytics
├── supabase/          # Migrations and config
├── worker/            # Background job processor
├── prisma/            # Database schema
├── docs/              # Documentation
└── tests/             # Test files
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checker |
| `npm test` | Run unit tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `supabase start` | Start local Supabase |
| `supabase db reset` | Reset database with migrations |

## Adding New Features

### New Database Table

1. Create migration: `supabase migration new create_my_table`
2. Edit `supabase/migrations/YYYYMMDDHHMMSS_create_my_table.sql`
3. Apply: `supabase db reset`
4. Update `prisma/schema.prisma`
5. Generate client: `npm run db:generate`

### New API Route

1. Create file: `src/app/api/my-route/route.ts`
2. Export HTTP method handlers (GET, POST, etc.)
3. Use `createServerClient()` for Supabase access

### New Component

1. Create file: `src/components/my-component.tsx`
2. Use `createBrowserClient()` for client-side Supabase
3. Add to page or layout as needed

## Testing

```bash
# Unit tests
npm test

# With coverage
npm test -- --coverage

# E2E tests (requires dev server)
npm run test:e2e
```

## Code Style

- TypeScript strict mode enabled
- ESLint with Next.js config
- Prettier for formatting
- Conventional commits for git messages
