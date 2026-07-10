-- ============================================================================
-- Migration: 00000000000019_create_queue_tables
-- Purpose: Background job queue using SKIP LOCKED pattern
--
-- Features:
--   - Claim job: Atomically pick up pending job
--   - Complete job: Mark as done with results
--   - Fail job: Mark as failed with retry logic
--   - Scheduled jobs: Run at specific time
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_queue (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    payload         TEXT DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'pending',
    priority        INTEGER NOT NULL DEFAULT 0,
    attempt         INTEGER NOT NULL DEFAULT 0,
    max_attempts    INTEGER NOT NULL DEFAULT 3,
    error_message   TEXT,
    result          TEXT,
    scheduled_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),
    started_at      TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for pending jobs by priority
CREATE INDEX IF NOT EXISTS idx_job_queue_status_priority
    ON job_queue (status, priority DESC, scheduled_at);

-- Index for scheduled jobs
CREATE INDEX IF NOT EXISTS idx_job_queue_scheduled_at
    ON job_queue (scheduled_at);

-- Function to claim the next pending job
CREATE OR REPLACE FUNCTION claim_next_job(worker_name TEXT DEFAULT 'worker')
RETURNS TABLE (
    job_id UUID,
    job_name TEXT,
    job_payload TEXT,
    job_attempt INTEGER
) AS $$
BEGIN
    RETURN QUERY
    UPDATE job_queue
    SET status = 'running',
        started_at = now(),
        attempt = attempt + 1
    WHERE id = (
        SELECT id
        FROM job_queue
        WHERE status = 'pending'
          AND scheduled_at <= now()
          AND attempt < max_attempts
        ORDER BY priority DESC, scheduled_at, created_at
        FOR UPDATE SKIP LOCKED
        LIMIT 1
    )
    RETURNING id, name, payload, attempt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a job
CREATE OR REPLACE FUNCTION complete_job(
    p_job_id UUID,
    p_result TEXT DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    UPDATE job_queue
    SET status = 'completed',
        result = p_result,
        completed_at = now()
    WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to fail a job
CREATE OR REPLACE FUNCTION fail_job(
    p_job_id UUID,
    p_error_message TEXT,
    p_retry_delay_seconds INTEGER DEFAULT 60
)
RETURNS VOID AS $$
BEGIN
    UPDATE job_queue
    SET status = CASE
            WHEN attempt >= max_attempts THEN 'failed'
            ELSE 'pending'
        END,
        error_message = p_error_message,
        scheduled_at = CASE
            WHEN attempt >= max_attempts THEN scheduled_at
            ELSE now() + (p_retry_delay_seconds || ' seconds')::INTERVAL
        END
    WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_queue_read_authenticated"
    ON job_queue FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "job_queue_write_authenticated"
    ON job_queue FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant execute on queue functions
GRANT EXECUTE ON FUNCTION claim_next_job(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION complete_job(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION fail_job(UUID, TEXT, INTEGER) TO anon, authenticated;
