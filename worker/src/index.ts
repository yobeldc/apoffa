/"use client"

import { useEffect, useState } from "react"

/**
 * Worker Index Status Hook
 * Polls the /api/index/status endpoint for indexing progress.
 */

export interface IndexStatus {
  status: "idle" | "indexing" | "completed" | "error"
  totalDocuments: number
  processedDocuments: number
  currentDocument: string | null
  startTime: string | null
  endTime: string | null
  error: string | null
}

export function useIndexStatus(pollInterval = 5000) {
  const [status, setStatus] = useState<IndexStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/index/status")
        if (response.ok) {
          const data: IndexStatus = await response.json()
          setStatus(data)
        }
      } catch {
        // Silently handle polling errors
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, pollInterval)
    return () => clearInterval(interval)
  }, [pollInterval])

  return { status, isLoading }
}

/**
 * IndexProgress Component
 * Visual progress indicator for document indexing.
 */
export function IndexProgress({ status }: { status: IndexStatus }) {
  const progress =
    status.totalDocuments > 0
      ? Math.round((status.processedDocuments / status.totalDocuments) * 100)
      : 0

  const statusColors = {
    idle: "bg-gray-400",
    indexing: "bg-blue-500 animate-pulse",
    completed: "bg-green-500",
    error: "bg-red-500",
  }

  const statusLabels = {
    idle: "Ready to index",
    indexing: `Indexing... ${status.currentDocument || ""}`,
    completed: "Indexing complete",
    error: `Error: ${status.error || "Unknown error"}`,
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{statusLabels[status.status]}</span>
        <span className="font-medium">
          {status.processedDocuments} / {status.totalDocuments}
        </span>
      </div>

      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${statusColors[status.status]}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        {status.startTime && (
          <span>Started: {new Date(status.startTime).toLocaleTimeString()}</span>
        )}
        {status.endTime && (
          <span className="ml-4">
            Completed: {new Date(status.endTime).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * TriggerIndexButton
 * Button to start/stop the indexing process.
 */
export function TriggerIndexButton() {
  const [isTriggering, setIsTriggering] = useState(false)

  const handleTrigger = async () => {
    setIsTriggering(true)
    try {
      const response = await fetch("/api/index/trigger", { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to trigger indexing")
      }
    } catch (error) {
      console.error("Trigger failed:", error)
    } finally {
      setIsTriggering(false)
    }
  }

  return (
    <button
      onClick={handleTrigger}
      disabled={isTriggering}
      className="px-4 py-2 rounded-md bg-primary text-primary-foreground
                 font-medium hover:bg-primary/90 disabled:opacity-50"
    >
      {isTriggering ? "Starting..." : "Start Indexing"}
    </button>
  )
}
