/**
 * Apoffa Worker — Background Job Processor
 *
 * Polls the job queue (pgmq or in-memory) and processes jobs:
 *   - document_ingestion: Parse PDFs, extract text, chunk
 *   - embedding_generation: Generate vector embeddings
 *   - case_analysis: AI-powered case analysis
 *   - export_jobs: Generate export files
 *
 * Usage:
 *   node worker/index.js
 *
 * Environment:
 *   DATABASE_URL          - PostgreSQL connection string
 *   SUPABASE_URL          - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
 *   WORKER_CONCURRENCY    - Number of concurrent jobs (default: 4)
 *   WORKER_POLL_INTERVAL_MS - Queue poll interval (default: 5000ms)
 */

const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Job handlers
const { handleDocumentIngestion } = require('./jobs/document-ingestion');
const { handleEmbeddingGeneration } = require('./jobs/embedding-generation');
const { handleCaseAnalysis } = require('./jobs/case-analysis');
const { handleExportJob } = require('./jobs/export');

// Configuration
const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '4', 10);
const POLL_INTERVAL_MS = parseInt(process.env.WORKER_POLL_INTERVAL_MS || '5000', 10);
const MAX_JOBS_PER_WORKER = parseInt(process.env.WORKER_MAX_JOBS_PER_WORKER || '100', 10);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: CONCURRENCY + 2,
});

// Supabase client (for storage, auth)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Job router
const jobHandlers = {
  document_ingestion: handleDocumentIngestion,
  embedding_generation: handleEmbeddingGeneration,
  case_analysis: handleCaseAnalysis,
  export_jobs: handleExportJob,
};

// Track active jobs
let activeJobs = 0;
let totalProcessed = 0;
let shuttingDown = false;

/**
 * Process a single job
 */
async function processJob(job) {
  const { job_id, job_name, job_payload, job_attempt } = job;

  console.log(`[${new Date().toISOString()}] Processing job: ${job_name} (id=${job_id}, attempt=${job_attempt})`);

  const handler = jobHandlers[job_name];
  if (!handler) {
    console.error(`Unknown job type: ${job_name}`);
    await failJob(job_id, `Unknown job type: ${job_name}`);
    return;
  }

  const startTime = Date.now();
  try {
    const payload = JSON.parse(job_payload);
    await handler(payload, { pool, supabase });

    const duration = Date.now() - startTime;
    await completeJob(job_id, JSON.stringify({ duration_ms: duration }));

    console.log(`[${new Date().toISOString()}] Completed job: ${job_name} (id=${job_id}, ${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Failed job: ${job_name} (id=${job_id}, ${duration}ms):`, error.message);
    await failJob(job_id, error.message, job_attempt >= 3 ? null : 60);
  }
}

/**
 * Claim and process jobs from the queue
 */
async function pollQueue() {
  if (shuttingDown) return;
  if (activeJobs >= CONCURRENCY) return;

  try {
    const client = await pool.connect();
    try {
      // Try pgmq first
      const { rows } = await client.query(`
        SELECT * FROM pgmq.read('document_ingestion', 30, $1)
        UNION ALL
        SELECT * FROM pgmq.read('embedding_generation', 30, $1)
        UNION ALL
        SELECT * FROM pgmq.read('case_analysis', 30, $1)
        UNION ALL
        SELECT * FROM pgmq.read('export_jobs', 30, $1)
        LIMIT $1
      `, [CONCURRENCY - activeJobs]);

      for (const row of rows) {
        if (shuttingDown) break;
        if (activeJobs >= CONCURRENCY) break;

        activeJobs++;
        const job = {
          job_id: row.msg_id,
          job_name: row.queue_name,
          job_payload: JSON.stringify(row.message),
          job_attempt: row.read_ct || 1,
        };

        processJob(job)
          .finally(() => {
            activeJobs--;
            totalProcessed++;
          });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Queue poll error:', error.message);
  }
}

/**
 * Mark job as completed
 */
async function completeJob(jobId, result) {
  const client = await pool.connect();
  try {
    await client.query('SELECT pgmq.delete($1)', [jobId]);
  } catch {
    // Fallback: try the job_queue table
    await client.query('SELECT complete_job($1, $2)', [jobId, result]);
  } finally {
    client.release();
  }
}

/**
 * Mark job as failed
 */
async function failJob(jobId, errorMessage, retryDelaySeconds = 60) {
  const client = await pool.connect();
  try {
    await client.query('SELECT pgmq.archive($1)', [jobId]);
  } catch {
    // Fallback: try the job_queue table
    await client.query('SELECT fail_job($1, $2, $3)', [jobId, errorMessage, retryDelaySeconds]);
  } finally {
    client.release();
  }
}

/**
 * Graceful shutdown
 */
function shutdown() {
  console.log('Shutting down worker...');
  shuttingDown = true;

  const timeout = setTimeout(() => {
    console.log('Force exit after timeout');
    process.exit(1);
  }, 30000);

  const checkInterval = setInterval(() => {
    if (activeJobs === 0) {
      clearInterval(checkInterval);
      clearTimeout(timeout);
      pool.end();
      console.log('Worker stopped');
      process.exit(0);
    }
  }, 1000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start polling
console.log(`Apoffa Worker started (concurrency=${CONCURRENCY}, poll_interval=${POLL_INTERVAL_MS}ms)`);

setInterval(pollQueue, POLL_INTERVAL_MS);
pollQueue(); // Initial poll
