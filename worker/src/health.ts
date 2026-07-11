/"use client"

import { useEffect, useState } from "react"

/**
 * Health Status Types
 */
export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  version: string
  services: {
    supabase: ServiceHealth
    ai: ServiceHealth
    vectorStore: ServiceHealth
  }
  metrics: {
    requestCount: number
    avgResponseTime: number
    errorRate: number
  }
}

interface ServiceHealth {
  status: "up" | "down" | "unknown"
  latency: number
  lastChecked: string
}

/**
 * useHealth Hook
 * Polls the health endpoint for system status.
 */
export function useHealth(pollInterval = 30000) {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health")
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`)
        }
        const data: HealthStatus = await response.json()
        setHealth(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Health check failed")
        setHealth(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, pollInterval)
    return () => clearInterval(interval)
  }, [pollInterval])

  return { health, isLoading, error }
}

/**
 * HealthIndicator Component
 * Displays a visual health status indicator.
 */
export function HealthIndicator({ status }: { status: HealthStatus["status"] }) {
  const colors = {
    healthy: "bg-green-500",
    degraded: "bg-yellow-500",
    unhealthy: "bg-red-500",
  }

  const labels = {
    healthy: "All Systems Operational",
    degraded: "Some Services Degraded",
    unhealthy: "System Unhealthy",
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${colors[status]}`} />
      <span className="text-sm text-muted-foreground">{labels[status]}</span>
    </div>
  )
}

/**
 * HealthDashboard Component
 * Full health status display for admin/monitoring.
 */
export function HealthDashboard() {
  const { health, isLoading, error } = useHealth()

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !health) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
          <p className="font-medium">Health Check Failed</p>
          <p className="text-sm">{error || "Unable to retrieve health status"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">System Health</h2>
        <HealthIndicator status={health.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(health.services).map(([name, service]) => (
          <div
            key={name}
            className="p-4 rounded-lg border bg-card"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium capitalize">{name}</h3>
              <span
                className={`w-2 h-2 rounded-full ${
                  service.status === "up"
                    ? "bg-green-500"
                    : service.status === "down"
                    ? "bg-red-500"
                    : "bg-gray-400"
                }`}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Latency: {service.latency}ms
            </p>
            <p className="text-xs text-muted-foreground">
              Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Requests</p>
          <p className="text-2xl font-semibold">{health.metrics.requestCount}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Avg Response Time</p>
          <p className="text-2xl font-semibold">
            {health.metrics.avgResponseTime}ms
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Error Rate</p>
          <p className="text-2xl font-semibold">
            {(health.metrics.errorRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
}
