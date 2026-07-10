import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';
import { EntityType, RelationshipType } from './types';
import type { ExtractedEntity, ExtractedRelationship } from './types';

const log = logger.child({ module: 'apoffa-graph:extract' });

// ─── Configuration ───────────────────────────────────────────

const MAX_ENTITY_NAME_LENGTH = 128;
const MIN_ENTITY_NAME_LENGTH = 2;

// ─── Entity Extraction ───────────────────────────────────────

/**
 * Extract entities from raw text using pattern matching.
 * This is a baseline implementation that can be enhanced with NLP.
 */
export async function extractEntities(text: string, caseId: string): Promise<ExtractedEntity[]> {
  log.info({ caseId, textLength: text.length }, 'Extracting entities from text');

  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  // Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex) || [];
  for (const email of emails) {
    const key = `email:${email.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      entities.push({
        name: email.toLowerCase(),
        type: EntityType.EMAIL,
        metadata: { source: 'regex', original: email },
      });
    }
  }

  // Phone numbers (various formats)
  const phoneRegex = /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
  const phones = [...text.matchAll(phoneRegex)];
  for (const phone of phones) {
    const normalized = `+1-${phone[1]}-${phone[2]}-${phone[3]}`;
    const key = `phone:${normalized}`;
    if (!seen.has(key)) {
      seen.add(key);
      entities.push({
        name: normalized,
        type: EntityType.PHONE,
        metadata: { source: 'regex', original: phone[0] },
      });
    }
  }

  // URLs
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  for (const url of urls) {
    try {
      const parsed = new URL(url);
      const domain = parsed.hostname.toLowerCase();
      const key = `url:${domain}`;
      if (!seen.has(key)) {
        seen.add(key);
        entities.push({
          name: domain,
          type: EntityType.URL,
          metadata: { source: 'regex', original: url, protocol: parsed.protocol },
        });
      }
    } catch {
      // Invalid URL, skip
    }
  }

  // IP addresses
  const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  const ips = text.match(ipRegex) || [];
  for (const ip of ips) {
    const key = `ip:${ip}`;
    if (!seen.has(key)) {
      seen.add(key);
      entities.push({
        name: ip,
        type: EntityType.IP_ADDRESS,
        metadata: { source: 'regex' },
      });
    }
  }

  // MAC addresses
  const macRegex = /\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b/g;
  const macs = text.match(macRegex) || [];
  for (const mac of macs) {
    const key = `mac:${mac.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      entities.push({
        name: mac.toLowerCase(),
        type: EntityType.MAC_ADDRESS,
        metadata: { source: 'regex' },
      });
    }
  }

  // Named entities using simple pattern matching (words in Title Case)
  // This is a placeholder for proper NER
  const titleCaseRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const titleCases = text.match(titleCaseRegex) || [];
  for (const name of titleCases) {
    const trimmed = name.trim();
    if (
      trimmed.length >= MIN_ENTITY_NAME_LENGTH &&
      trimmed.length <= MAX_ENTITY_NAME_LENGTH &&
      !isCommonWord(trimmed)
    ) {
      const key = `person:${trimmed.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        entities.push({
          name: trimmed,
          type: EntityType.PERSON,
          metadata: { source: 'heuristic', confidence: 0.3 },
        });
      }
    }
  }

  log.info({ caseId, entityCount: entities.length }, 'Entity extraction complete');
  return entities;
}

/**
 * Extract relationships between entities based on proximity and context.
 */
export async function extractRelationships(
  text: string,
  entities: ExtractedEntity[],
  caseId: string
): Promise<ExtractedRelationship[]> {
  log.info({ caseId, entityCount: entities.length }, 'Extracting relationships');

  const relationships: ExtractedRelationship[] = [];
  const seen = new Set<string>();

  // Simple co-occurrence: entities appearing near each other may be related
  const windowSize = 100; // characters

  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const e1 = entities[i];
      const e2 = entities[j];

      // Check proximity in text
      const idx1 = text.indexOf(e1.name);
      const idx2 = text.indexOf(e2.name);

      if (idx1 >= 0 && idx2 >= 0 && Math.abs(idx1 - idx2) <= windowSize) {
        const key = `${e1.name}::${e2.name}`;
        if (!seen.has(key)) {
          seen.add(key);
          relationships.push({
            sourceName: e1.name,
            targetName: e2.name,
            type: RelationshipType.RELATED,
            metadata: { source: 'co-occurrence', distance: Math.abs(idx1 - idx2) },
          });
        }
      }
    }
  }

  log.info({ caseId, relationshipCount: relationships.length }, 'Relationship extraction complete');
  return relationships;
}

/**
 * Persist extracted entities and relationships to the database.
 */
export async function persistExtraction(
  caseId: string,
  entities: ExtractedEntity[],
  relationships: ExtractedRelationship[]
): Promise<void> {
  log.info({ caseId, entityCount: entities.length, relationshipCount: relationships.length }, 'Persisting extraction');

  const entityMap = new Map<string, string>(); // name -> id

  // Upsert entities
  for (const entity of entities) {
    const normalizedName = entity.name.slice(0, MAX_ENTITY_NAME_LENGTH);

    const result = await prisma.entity.upsert({
      where: {
        // Use a composite unique constraint or findFirst
        // For now, we'll use findFirst + create/update pattern
      },
      // Since we don't have a unique constraint on name+type, we query first
    });

    // Simpler approach: find existing or create
    let existing = await prisma.entity.findFirst({
      where: { name: normalizedName, type: entity.type },
    });

    if (!existing) {
      existing = await prisma.entity.create({
        data: {
          name: normalizedName,
          type: entity.type,
          metadata: entity.metadata || {},
        },
      });
    }

    entityMap.set(entity.name, existing.id);

    // Link to case
    await prisma.caseEntity.upsert({
      where: {
        caseId_entityId: { caseId, entityId: existing.id },
      },
      create: {
        caseId,
        entityId: existing.id,
        relevance: entity.metadata?.confidence || 0.5,
      },
      update: {
        relevance: entity.metadata?.confidence || 0.5,
      },
    });
  }

  // Upsert relationships
  for (const rel of relationships) {
    const sourceId = entityMap.get(rel.sourceName);
    const targetId = entityMap.get(rel.targetName);

    if (!sourceId || !targetId) continue;

    await prisma.relationship.upsert({
      where: {
        sourceId_targetId_type: { sourceId, targetId, type: rel.type },
      },
      create: {
        sourceId,
        targetId,
        type: rel.type,
        metadata: rel.metadata || {},
      },
      update: {
        metadata: rel.metadata || {},
      },
    });
  }

  log.info({ caseId }, 'Extraction persisted successfully');
}

// ─── Helpers ─────────────────────────────────────────────────

const COMMON_WORDS = new Set([
  'The', 'A', 'An', 'And', 'Or', 'But', 'In', 'On', 'At', 'To', 'For',
  'Of', 'With', 'By', 'From', 'As', 'Is', 'Was', 'Are', 'Be', 'Been',
  'Have', 'Has', 'Had', 'Do', 'Does', 'Did', 'Will', 'Would', 'Could',
  'Should', 'May', 'Might', 'Can', 'Shall', 'This', 'That', 'These',
  'Those', 'I', 'You', 'He', 'She', 'It', 'We', 'They', 'Me', 'Him',
  'Her', 'Us', 'Them', 'My', 'Your', 'His', 'Its', 'Our', 'Their',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December',
]);

function isCommonWord(word: string): boolean {
  return COMMON_WORDS.has(word);
}
