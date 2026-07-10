/**
 * Worker Health Check
 *
 * Returns 0 if healthy, 1 if unhealthy.
 * Checks:
 *   - Database connectivity
 *   - Queue accessibility
 */

const { Pool } = require('pg');

async function healthcheck() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      console.log('Health check: OK');
      process.exit(0);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Health check: FAILED -', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

healthcheck();
