/**
 * Human-in-the-loop review system for APOffa Graph.
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { EntityNode, EntityEdge } from './ui-types';

const log = logger.child({ module: 'apoffa-graph:review' });

export type ReviewItemType = 'entity' | 'relationship' | 'merge' | 'delete';

export interface ReviewItem {
  id: string; type: ReviewItemType; caseId: string; description: string;
  data: unknown; suggestedBy: string; suggestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string; reviewedAt?: Date; notes?: string;
}

export async function createReviewItem(caseId: string, type: ReviewItemType, description: string, data: unknown, suggestedBy: string): Promise<ReviewItem> {
  log.info({ caseId, type }, 'Creating review item');
  const item = await prisma.caseHistory.create({ data: { caseId, event: `review_${type}`, details: JSON.stringify({ description, data, status: 'pending' }), createdBy: suggestedBy } });
  return { id: item.id, type, caseId, description, data, suggestedBy, suggestedAt: item.createdAt, status: 'pending' };
}

export async function getReviewQueue(caseId: string): Promise<ReviewItem[]> {
  const items = await prisma.caseHistory.findMany({ where: { caseId, event: { startsWith: 'review_' } }, orderBy: { createdAt: 'asc' } });
  return items.map(item => { const d = JSON.parse(item.details || '{}'); const t = item.event.replace('review_', '') as ReviewItemType; return { id: item.id, type: t, caseId: item.caseId, description: d.description || '', data: d.data || {}, suggestedBy: item.createdBy || '', suggestedAt: item.createdAt, status: d.status || 'pending', reviewedBy: d.reviewedBy, reviewedAt: d.reviewedAt, notes: d.notes }; });
}

export async function approveReviewItem(reviewId: string, reviewerId: string, notes?: string): Promise<ReviewItem> {
  log.info({ reviewId }, 'Approving');
  const item = await prisma.caseHistory.findUniqueOrThrow({ where: { id: reviewId } });
  const d = JSON.parse(item.details || '{}');
  d.status = 'approved'; d.reviewedBy = reviewerId; d.reviewedAt = new Date().toISOString(); d.notes = notes;
  await prisma.caseHistory.update({ where: { id: reviewId }, data: { details: JSON.stringify(d) } });
  const type = item.event.replace('review_', '') as ReviewItemType;
  await applyChange(type, d.data, item.caseId);
  return { id: item.id, type, caseId: item.caseId, description: d.description || '', data: d.data, suggestedBy: item.createdBy || '', suggestedAt: item.createdAt, status: 'approved', reviewedBy: reviewerId, reviewedAt: new Date(), notes };
}

export async function rejectReviewItem(reviewId: string, reviewerId: string, notes?: string): Promise<ReviewItem> {
  const item = await prisma.caseHistory.findUniqueOrThrow({ where: { id: reviewId } });
  const d = JSON.parse(item.details || '{}');
  d.status = 'rejected'; d.reviewedBy = reviewerId; d.reviewedAt = new Date().toISOString(); d.notes = notes;
  await prisma.caseHistory.update({ where: { id: reviewId }, data: { details: JSON.stringify(d) } });
  return { id: item.id, type: item.event.replace('review_', '') as ReviewItemType, caseId: item.caseId, description: d.description || '', data: d.data, suggestedBy: item.createdBy || '', suggestedAt: item.createdAt, status: 'rejected', reviewedBy: reviewerId, reviewedAt: new Date(), notes };
}

async function applyChange(type: ReviewItemType, data: unknown, caseId: string) {
  switch (type) {
    case 'entity': { const n = data as EntityNode; await prisma.entity.upsert({ where: { id: n.id }, create: { id: n.id, name: n.name, type: n.type, metadata: n.metadata || {} }, update: { name: n.name, type: n.type } }); break; }
    case 'relationship': { const e = data as EntityEdge; await prisma.relationship.upsert({ where: { sourceId_targetId_type: { sourceId: e.source, targetId: e.target, type: e.type } }, create: { sourceId: e.source, targetId: e.target, type: e.type, metadata: e.metadata || {} }, update: { metadata: e.metadata || {} } }); break; }
    case 'merge': { const m = data as { sourceId: string; targetId: string }; await prisma.$transaction([ prisma.relationship.updateMany({ where: { sourceId: m.sourceId }, data: { sourceId: m.targetId } }), prisma.relationship.updateMany({ where: { targetId: m.sourceId }, data: { targetId: m.targetId } }), prisma.entity.delete({ where: { id: m.sourceId } }) ]); break; }
    case 'delete': { const d = data as { id: string }; await prisma.entity.deleteMany({ where: { id: d.id } }); break; }
  }
  log.info({ type, caseId }, 'Change applied');
}
