#!/bin/bash
# =============================================================================
# Health Check Script for Apoffa
# =============================================================================
# Usage: ./scripts/health-check.sh [ENVIRONMENT]
#   ENVIRONMENT: local | staging | production (default: local)
# =============================================================================

set -euo pipefail

ENV="${1:-local}"
BASE_URL=""

case "$ENV" in
  local)
    BASE_URL="http://localhost:3000"
    ;;
  staging)
    BASE_URL="${STAGING_URL:-https://staging.apoffa.app}"
    ;;
  production)
    BASE_URL="${PRODUCTION_URL:-https://apoffa.app}"
    ;;
  *)
    echo "Unknown environment: $ENV"
    echo "Usage: ./scripts/health-check.sh [local|staging|production]"
    exit 1
    ;;
esac

echo "========================================"
echo "Apoffa Health Check — $ENV"
echo "========================================"
echo ""

# Check API health
echo "→ Checking API health..."
if curl -sf "${BASE_URL}/api/health" > /dev/null 2>&1; then
  echo "  ✓ API is healthy"
else
  echo "  ✗ API health check failed"
  exit 1
fi

# Check search endpoint
echo "→ Checking search endpoint..."
if curl -sf "${BASE_URL}/api/search?q=test&limit=1" > /dev/null 2>&1; then
  echo "  ✓ Search endpoint responding"
else
  echo "  ✗ Search endpoint failed"
fi

# Check database connectivity via API
echo "→ Checking database connectivity..."
DB_HEALTH=$(curl -sf "${BASE_URL}/api/health/db" 2>/dev/null || echo "{}")
if echo "$DB_HEALTH" | grep -q '"status":"ok"' 2>/dev/null; then
  echo "  ✓ Database connected"
else
  echo "  ✗ Database check failed"
fi

# Check recent ingestion jobs
echo "→ Checking recent ingestion jobs..."
JOBS=$(curl -sf "${BASE_URL}/api/ingestion/jobs?limit=5" 2>/dev/null || echo "[]")
JOB_COUNT=$(echo "$JOBS" | grep -c '"id"' 2>/dev/null || echo "0")
echo "  → Found $JOB_COUNT recent job(s)"

echo ""
echo "========================================"
echo "Health check complete ✓"
echo "========================================"
