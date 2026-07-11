/"use client"

import { useEffect, useState, useCallback } from "react"

/**
 * Job Queue Types and React Hooks
 * Handles: Async job management with status polling.
 */

// ── Types ───────────────────────────────────────────────────────────

export type JobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"

export interface Job {
  id: string
  type: "ingestion" | "embedding" | "indexing" | "reindex"
  status: JobStatus
  payload: Record<string, unknown>
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  error: string | null
  result: Record<string, unknown> | null
  progress: number
}

export interface JobListResponse {
  jobs: Job[]
  total: number
  page: number
  perPage: number
}

export interface CreateJobRequest {
  type: Job["type"]
  payload: Record<string, unknown>
}

// ── API Functions ───────────────────────────────────────────────────

const API_BASE = "/api/jobs"

export async function fetchJobs(
  page = 1,
  perPage = 20,
  status?: JobStatus
): Promise<JobListResponse> {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) })
  if (status) params.append("status", status)

  const response = await fetch(`${API_BASE}?${params}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.status}`)
  }
  return response.json()
}

export async function fetchJob(id: string): Promise<Job> {
  const response = await fetch(`${API_BASE}/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch job: ${response.status}`)
  }
  return response.json()
}

export async function createJob(request: CreateJobRequest): Promise<Job> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    throw new Error(`Failed to create job: ${response.status}`)
  }
  return response.json()
}

export async function cancelJob(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}/cancel`, { method: "POST" })
  if (!response.ok) {
    throw new Error(`Failed to cancel job: ${response.status}`)
  }
}

// ── React Hooks ─────────────────────────────────────────────────────

/**
 * useJobList Hook
 * Fetches and polls the job list.
 */
export function useJobList(pollInterval = 5000) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const response = await fetchJobs(page)
      setJobs(response.jobs)
      setTotal(response.total)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs")
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, pollInterval)
    return () => clearInterval(interval)
  }, [refresh, pollInterval])

  return { jobs, isLoading, error, page, setPage, total, refresh }
}

/**
 * useJob Hook
 * Polls a single job's status.
 */
export function useJob(id: string | null, pollInterval = 3000) {
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(!!id)

  useEffect(() => {
    if (!id) return

    const fetchJobStatus = async () => {
      try {
        const data = await fetchJob(id)
        setJob(data)
      } catch {
        // Silently handle polling errors
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobStatus()
    const interval = setInterval(fetchJobStatus, pollInterval)
    return () => clearInterval(interval)
  }, [id, pollInterval])

  return { job, isLoading }
}

// ── Job Status Badge ────────────────────────────────────────────────

const statusConfig: Record<
  JobStatus,
  { label: string; className: string }
> = {
  queued: {
    label: "Queued",
    className: "bg-yellow-100 text-yellow-800",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-100 text-blue-800 animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-800",
  },
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}

// ── Job List UI ─────────────────────────────────────────────────────

export function JobListView() {
  const { jobs, isLoading, error, page, setPage, total } = useJobList()

  if (isLoading && jobs.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-medium">Error loading jobs</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No jobs found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{job.type}</span>
              <JobStatusBadge status={job.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              Created: {new Date(job.createdAt).toLocaleString()}
            </p>
            {job.error && (
              <p className="text-xs text-red-600">{job.error}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {job.status === "processing" && (
              <div className="w-24">
                <div className="text-xs text-muted-foreground text-right mb-1">
                  {job.progress}%
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
