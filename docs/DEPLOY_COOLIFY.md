# Deploy to Coolify

## Prerequisites

- A Coolify instance (self-hosted or managed)
- A PostgreSQL database (Coolify-managed or external)
- Domain name (optional, Coolify provides subdomains)

## Step 1: Create Resources

1. In Coolify dashboard, create a new **PostgreSQL** resource:
   - Name: `apoffa-postgres`
   - Version: 15
   - Database: `apoffa`
   - User: `apoffa`

2. Note the connection string from the resource details.

## Step 2: Create Application

1. Create a new **Application** resource:
   - Name: `apoffa`
   - Build Pack: `dockerfile`
   - Repository: Your Git repository URL

2. In **Environment Variables**, add:
   ```env
   DATABASE_URL=postgresql://apoffa:PASSWORD@apoffa-postgres:5432/apoffa
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   RAG_ENABLED=true
   RAG_EMBEDDING_PROVIDER=ollama
   RAG_LLM_PROVIDER=ollama
   ```

3. In **Storages**, add a persistent volume:
   - Path: `/app/data`

## Step 3: Deploy

1. Click **Deploy** and wait for the build to complete.
2. Access your application via the provided URL.

## Step 4: Run Migrations

After first deployment, run migrations:
```bash
# In Coolify, open the application container terminal
npx prisma migrate deploy
```

## Troubleshooting

### Build fails with "out of memory"
Increase the build memory limit in Coolify settings.

### Database connection errors
Verify the `DATABASE_URL` format and ensure the PostgreSQL resource is running.

### Static assets not loading
Check that `next.config.mjs` has the correct `output` setting for Docker.
