/"use client"

import { useState } from "react"

/**
 * Ingestion Pipeline Types and UI Components
 * Handles: Document ingestion workflow configuration and status.
 */

// ── Types ───────────────────────────────────────────────────────────

export interface PipelineConfig {
  name: string
  description: string
  steps: PipelineStep[]
  schedule: "manual" | "hourly" | "daily" | "weekly"
  source: string
  enabled: boolean
}

export interface PipelineStep {
  id: string
  name: string
  type: "extract" | "transform" | "embed" | "index" | "validate"
  config: Record<string, unknown>
  enabled: boolean
}

export interface PipelineStatus {
  id: string
  configId: string
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  startedAt: string | null
  completedAt: string | null
  progress: number
  currentStep: string | null
  errors: PipelineError[]
  stats: PipelineStats
}

export interface PipelineError {
  step: string
  message: string
  timestamp: string
  documentId?: string
}

export interface PipelineStats {
  totalDocuments: number
  processedDocuments: number
  failedDocuments: number
  skippedDocuments: number
  chunksGenerated: number
  embeddingsGenerated: number
  averageProcessingTime: number
}

// ── Default Pipeline Configuration ──────────────────────────────────

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  name: "Default Ingestion Pipeline",
  description: "Standard document ingestion with OCR, chunking, and embedding",
  steps: [
    {
      id: "extract",
      name: "Document Extraction",
      type: "extract",
      config: {
        ocrEnabled: true,
        extractTables: true,
        extractImages: false,
      },
      enabled: true,
    },
    {
      id: "transform",
      name: "Text Transformation",
      type: "transform",
      config: {
        normalizeWhitespace: true,
        removeHeadersFooters: true,
        languageDetection: true,
      },
      enabled: true,
    },
    {
      id: "chunk",
      name: "Text Chunking",
      type: "transform",
      config: {
        strategy: "semantic",
        chunkSize: 512,
        chunkOverlap: 50,
        minChunkSize: 100,
      },
      enabled: true,
    },
    {
      id: "embed",
      name: "Embedding Generation",
      type: "embed",
      config: {
        model: "bge-base-en-v1.5",
        batchSize: 32,
        normalize: true,
      },
      enabled: true,
    },
    {
      id: "index",
      name: "Vector Indexing",
      type: "index",
      config: {
        indexType: "ivfflat",
        lists: 100,
        updateTsVector: true,
      },
      enabled: true,
    },
    {
      id: "validate",
      name: "Quality Validation",
      type: "validate",
      config: {
        minChunkQuality: 0.5,
        checkDuplicates: true,
        maxChunkCount: 10000,
      },
      enabled: true,
    },
  ],
  schedule: "manual",
  source: "upload",
  enabled: true,
}

// ── Pipeline Configuration Form ─────────────────────────────────────

interface PipelineConfigFormProps {
  config: PipelineConfig
  onChange: (config: PipelineConfig) => void
}

export function PipelineConfigForm({ config, onChange }: PipelineConfigFormProps) {
  const updateStep = (stepId: string, updates: Partial<PipelineStep>) => {
    onChange({
      ...config,
      steps: config.steps.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
    })
  }

  const toggleStep = (stepId: string) => {
    const step = config.steps.find((s) => s.id === stepId)
    if (step) {
      updateStep(stepId, { enabled: !step.enabled })
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pipeline Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => onChange({ ...config, name: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Schedule</label>
            <select
              value={config.schedule}
              onChange={(e) =>
                onChange({
                  ...config,
                  schedule: e.target.value as PipelineConfig["schedule"],
                })
              }
              className="w-full px-3 py-2 rounded-md border bg-background"
            >
              <option value="manual">Manual</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={config.description}
            onChange={(e) =>
              onChange({ ...config, description: e.target.value })
            }
            rows={2}
            className="w-full px-3 py-2 rounded-md border bg-background"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Processing Steps</h3>

        <div className="space-y-3">
          {config.steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border ${
                step.enabled ? "bg-card" : "bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6">
                    {index + 1}
                  </span>
                  <div>
                    <h4
                      className={`font-medium ${
                        !step.enabled && "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </h4>
                    <p className="text-xs text-muted-foreground capitalize">
                      {step.type}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleStep(step.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    step.enabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      step.enabled ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {step.enabled && (
                <div className="ml-9 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(step.config).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      {typeof value === "boolean" ? (
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            updateStep(step.id, {
                              config: {
                                ...step.config,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4"
                        />
                      ) : typeof value === "number" ? (
                        <input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            updateStep(step.id, {
                              config: {
                                ...step.config,
                                [key]: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-2 py-1 text-sm rounded border bg-background"
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(value)}
                          onChange={(e) =>
                            updateStep(step.id, {
                              config: {
                                ...step.config,
                                [key]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2 py-1 text-sm rounded border bg-background"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Pipeline Status Display ─────────────────────────────────────────

interface PipelineStatusProps {
  status: PipelineStatus
}

export function PipelineStatusDisplay({ status }: PipelineStatusProps) {
  const statusColors = {
    pending: "bg-yellow-500",
    running: "bg-blue-500 animate-pulse",
    completed: "bg-green-500",
    failed: "bg-red-500",
    cancelled: "bg-gray-500",
  }

  const statusLabels = {
    pending: "Pending",
    running: "Running",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${statusColors[status.status]}`} />
          <span className="font-medium">{statusLabels[status.status]}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {status.progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${statusColors[status.status]}`}
          style={{ width: `${status.progress}%` }}
        />
      </div>

      {/* Current Step */}
      {status.currentStep && (
        <p className="text-sm text-muted-foreground">
          Current step: <span className="font-medium">{status.currentStep}</span>
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold">{status.stats.totalDocuments}</p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground">Processed</p>
          <p className="text-lg font-semibold text-green-600">
            {status.stats.processedDocuments}
          </p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-lg font-semibold text-red-600">
            {status.stats.failedDocuments}
          </p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground">Chunks</p>
          <p className="text-lg font-semibold">{status.stats.chunksGenerated}</p>
        </div>
      </div>

      {/* Errors */}
      {status.errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-red-600">Errors ({status.errors.length})</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {status.errors.map((error, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-red-50 text-red-800 text-sm"
              >
                <p className="font-medium">{error.step}</p>
                <p>{error.message}</p>
                {error.documentId && (
                  <p className="text-xs mt-1">Doc: {error.documentId}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Pipeline List ───────────────────────────────────────────────────

interface PipelineListProps {
  pipelines: PipelineConfig[]
  statuses: Record<string, PipelineStatus>
  onRun: (configId: string) => void
  onEdit: (config: PipelineConfig) => void
  onDelete: (configId: string) => void
}

export function PipelineList({
  pipelines,
  statuses,
  onRun,
  onEdit,
  onDelete,
}: PipelineListProps) {
  return (
    <div className="space-y-4">
      {pipelines.map((pipeline) => {
        const status = statuses[pipeline.name]
        const isRunning = status?.status === "running"

        return (
          <div
            key={pipeline.name}
            className="p-4 rounded-lg border bg-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium">{pipeline.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {pipeline.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                    {pipeline.schedule}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                    {pipeline.steps.filter((s) => s.enabled).length} steps
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRun(pipeline.name)}
                  disabled={isRunning}
                  className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground
                             text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {isRunning ? "Running..." : "Run"}
                </button>
                <button
                  onClick={() => onEdit(pipeline)}
                  className="px-3 py-1.5 rounded-md border text-sm hover:bg-muted"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(pipeline.name)}
                  className="px-3 py-1.5 rounded-md border text-sm text-red-600
                             hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {status && <PipelineStatusDisplay status={status} />}
          </div>
        )
      })}
    </div>
  )
}
