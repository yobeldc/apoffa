/**
 * Evidence management for APOffa Graph.
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'apoffa-graph:evidence' });

export interface Evidence {
  id: string; entityId: string; caseId: string; documentId: string;
  excerpt: string; offset: number; length: number; confidence: number; createdAt: Date;
}

export async function saveEvidence(ev: Omit<Evidence, 'id' | 'createdAt'>): Promise<Evidence> {
  log.info({ entityId: ev.entityId }, 'Saving evidence');
  const r = await prisma.caseHistory.create({ data: { caseId: ev.caseId, event: 'evidence_added', details: JSON.stringify(ev), createdBy: 'system' } });
  return { id: r.id, ...ev, createdAt: r.createdAt };
}

export async function getEvidenceForEntity(entityId: string): Promise<Evidence[]> {
  const items = await prisma.caseHistory.findMany({ where: { event: 'evidence_added', details: { contains: entityId } }, orderBy: { createdAt: 'desc' } });
  return items.map(item => { const d = JSON.parse(item.details || '{}'); return { id: item.id, entityId: d.entityId || '', caseId: item.caseId, documentId: d.documentId || '', excerpt: d.excerpt || '', offset: d.offset || 0, length: d.length || 0, confidence: d.confidence || 0, createdAt: item.createdAt }; });
}

export async function calculateEntityConfidence(entityId: string): Promise<number> {
  const evidence = await getEvidenceForEntity(entityId);
  if (!evidence.length) return 0;
  const totalWeight = evidence.reduce((s, e) => s + e.length, 0);
  const weighted = evidence.reduce((s, e) => s + e.confidence * e.length, 0);
  return totalWeight > 0 ? weighted / totalWeight : 0;
}
