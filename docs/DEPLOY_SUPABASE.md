# Deploy to Supabase

## Prerequisites

- A Supabase account (free tier available)
- Supabase CLI installed locally

## Step 1: Create Project

1. Go to [Supabase Dashboard](https://app.supabase.com) and create a new project.
2. Note the **Project URL** and **API keys** (anon and service_role).

## Step 2: Push Migrations

```bash
# Link your local project to Supabase
supabase link --project-ref <project-ref>

# Push migrations
supabase db push

# Or apply via Prisma
DATABASE_URL=postgresql://... npx prisma migrate deploy
```

## Step 3: Configure Auth

1. In Supabase Dashboard, go to **Authentication > Settings**.
2. Set **Site URL** to your application URL.
3. Add your domain to **Redirect URLs**.

## Step 4: Configure Storage

1. Go to **Storage > Policies**.
2. Create buckets: `documents`, `exports`, `avatars`, `case-pdfs`.
3. Set appropriate access policies.

## Step 5: Configure Edge Functions (Optional)

```bash
supabase functions deploy hello
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Troubleshooting

### "Extension vector not found"
Enable pgvector in Supabase Dashboard: **Database > Extensions > vector**.

### RLS blocking reads
Check RLS policies in **Table Editor > Policies**.

### Slow vector search
Ensure HNSW index is created on the `chunk_embeddings` table.
