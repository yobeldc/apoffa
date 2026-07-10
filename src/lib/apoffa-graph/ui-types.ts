/**
 * UI-facing types for APOffa Graph visualization.
 */

export interface EntityNode {
  id: string;
  name: string;
  type: EntityNodeType;
  relevance?: number;
  metadata?: Record<string, unknown>;
  degree?: number;
  x?: number;
  y?: number;
  pinned?: boolean;
}

export type EntityNodeType =
  | 'PERSON' | 'EMAIL' | 'PHONE' | 'URL' | 'IP_ADDRESS'
  | 'MAC_ADDRESS' | 'ORGANIZATION' | 'LOCATION' | 'DEVICE' | 'FILE' | 'CUSTOM';

export interface EntityEdge {
  id: string;
  source: string;
  target: string;
  type: EntityEdgeType;
  label?: string;
  strength?: number;
  metadata?: Record<string, unknown>;
}

export type EntityEdgeType =
  | 'RELATED' | 'COMMUNICATED' | 'OWNED' | 'LOCATED_AT'
  | 'ACCESSED' | 'CONTAINS' | 'DERIVED_FROM' | 'CUSTOM';

export interface GraphLayout {
  nodes: EntityNode[];
  edges: EntityEdge[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  zoom: number;
  pan: { x: number; y: number };
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<string, number>;
  edgesByType: Record<string, number>;
  averageDegree: number;
  density: number;
  components: number;
}

export interface GraphExportOptions {
  format: 'png' | 'svg' | 'json' | 'csv';
  includeMetadata?: boolean;
  highlightNodes?: string[];
  backgroundColor?: string;
}
