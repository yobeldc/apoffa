/**
 * Database schema types and validation for APOffa Graph.
 */

import { z } from 'zod';

// ─── Entity Types ────────────────────────────────────────────

export enum EntityType {
  PERSON = 'PERSON',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  URL = 'URL',
  IP_ADDRESS = 'IP_ADDRESS',
  MAC_ADDRESS = 'MAC_ADDRESS',
  ORGANIZATION = 'ORGANIZATION',
  LOCATION = 'LOCATION',
  DEVICE = 'DEVICE',
  FILE = 'FILE',
  CUSTOM = 'CUSTOM',
}

export enum RelationshipType {
  RELATED = 'RELATED',
  COMMUNICATED = 'COMMUNICATED',
  OWNED = 'OWNED',
  LOCATED_AT = 'LOCATED_AT',
  ACCESSED = 'ACCESSED',
  CONTAINS = 'CONTAINS',
  DERIVED_FROM = 'DERIVED_FROM',
  CUSTOM = 'CUSTOM',
}

// ─── Zod Schemas ─────────────────────────────────────────────

export const EntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(128),
  type: z.nativeEnum(EntityType),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RelationshipSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  type: z.nativeEnum(RelationshipType),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});

export const CaseEntitySchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  entityId: z.string().uuid(),
  relevance: z.number().min(0).max(1).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});

// ─── Extracted Types (before persistence) ────────────────────

export interface ExtractedEntity {
  name: string;
  type: EntityType;
  metadata?: Record<string, unknown>;
}

export interface ExtractedRelationship {
  sourceName: string;
  targetName: string;
  type: RelationshipType;
  metadata?: Record<string, unknown>;
}

// ─── Validation Helpers ──────────────────────────────────────

export function validateEntity(data: unknown) {
  return EntitySchema.parse(data);
}

export function validateRelationship(data: unknown) {
  return RelationshipSchema.parse(data);
}

export function isValidEntityType(type: string): type is EntityType {
  return Object.values(EntityType).includes(type as EntityType);
}

export function isValidRelationshipType(type: string): type is RelationshipType {
  return Object.values(RelationshipType).includes(type as RelationshipType);
}
