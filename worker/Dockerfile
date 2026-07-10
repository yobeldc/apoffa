# ============================================================================
# Apoffa Worker — Background Job Processor
# ============================================================================
# This Dockerfile builds the worker image for processing background jobs:
#   - Document ingestion (PDF parsing, OCR, chunking)
#   - Embedding generation
#   - Case analysis
#   - Export generation
#
# Build:
#   docker build -f worker/Dockerfile -t apoffa-worker .
#
# Run:
#   docker run -e DATABASE_URL=... -e SUPABASE_URL=... apoffa-worker
# ============================================================================

FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    postgresql-client

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy worker source
COPY worker ./worker/
COPY src/lib ./src/lib/

# Set environment
ENV NODE_ENV=production
ENV WORKER_CONCURRENCY=4
ENV WORKER_POLL_INTERVAL_MS=5000
ENV WORKER_MAX_JOBS_PER_WORKER=100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node worker/healthcheck.js

# Run worker
CMD ["node", "worker/index.js"]
