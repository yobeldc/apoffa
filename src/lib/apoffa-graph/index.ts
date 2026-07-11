/**
 * AP OFFA Graph Library
 * Handles: Data normalization and graph utilities for AP OFFA legal data.
 */

export * from "./normalize"

export interface APOffaNode {
  id: string
  label: string
  type: "putusan" | "hakim" | "pasal" | "perkara" | "tuntutan"
  data: Record<string, unknown>
}

export interface APOffaEdge {
  source: string
  target: string
  label: string
  weight: number
}

export interface APOffaGraph {
  nodes: APOffaNode[]
  edges: APOffaEdge[]
}
