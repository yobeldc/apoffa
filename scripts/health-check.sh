#!/bin/bash
# Health check script for APOffa services

set -e

API_URL="${API_URL:-http://localhost:3000}"
TIMEOUT=10

echo "=== APOffa Health Check ==="
echo "API URL: $API_URL"
echo ""

# Check API
echo -n "API Health... "
if curl -sf --max-time "$TIMEOUT" "$API_URL/api/health" > /dev/null 2>&1; then
  echo "OK"
else
  echo "FAIL"
  exit 1
fi

# Check database (via API)
echo -n "Database... "
DB_STATUS=$(curl -sf --max-time "$TIMEOUT" "$API_URL/api/health/db" 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
if [ "$DB_STATUS" = "healthy" ]; then
  echo "OK"
else
  echo "FAIL ($DB_STATUS)"
  exit 1
fi

echo ""
echo "All checks passed!"
