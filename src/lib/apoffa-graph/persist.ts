/**
 * Persistence layer for APOffa Graph data.
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { EntityNode, EntityEdge, GraphLayout } from './ui-types';

const log = logger.child({ module: 'apoffa-graph:persist' });

export async function saveGraphLayout(caseId: string, layout: GraphLayout): Promise<void> {
  log.info({ caseId, nodeCount: layout.nodes.length }, 'Saving layout');
  await prisma.$transaction(
    layout.nodes.map(n =>
      prisma.caseEntity.updateMany({
        where: { caseId, entityId: n.id },
        data: { metadata: { x: n.x, y: n.y, pinned: n.pinned } },
      })
    )
  );
}

export async function loadGraphLayout(caseId: string): Promise<GraphLayout | null> {
  log.info({ caseId }, 'Loading layout');
  const caseEntities = await prisma.caseEntity.findMany({
    where: { caseId },
    include: {
      entity: {
        include: {
          sourceRelationships: { include: { target: true } },
          targetRelationships: { include: { source: true } },
        },
      },
    },
  });

  if (!caseEntities.length) return null;

  const nodes: EntityNode[] = caseEntities.map(ce => ({
    id: ce.entity.id,
    name: ce.entity.name,
    type: ce.entity.type as EntityNode['type'],
    relevance: ce.relevance ?? undefined,
    degree: ce.entity.sourceRelationships.length + ce.entity.targetRelationships.length,
    x: (ce.metadata as Record<string, number> | null)?.x ?? undefined,
    y: (ce.metadata as Record<string, number> | null)?.y ?? undefined,
    pinned: (ce.metadata as Record<string, boolean> | null)?.pinned ?? undefined,
  }));

  const edgeSet = new Set<string>();
  const edges: EntityEdge[] = [];
  for (const ce of caseEntities) {
    for (const rel of [...ce.entity.sourceRelationships, ...ce.entity.targetRelationships]) {
      const id = `${rel.sourceId}-${rel.targetId}`;
      if (!edgeSet.has(id)) {
        edgeSet.add(id);
        edges.push({ id, source: rel.sourceId, target: rel.targetId, type: rel.type as EntityEdge['type'], label: rel.type });
      }
    }
  }

  const xs = nodes.map(n => n.x ?? 0).filter(x => x !== 0);
  const ys = nodes.map(n => n.y ?? 0).filter(y => y !== 0);

  return {
    nodes,
    edges,
    bounds: { minX: xs.length ? Math.min(...xs) : 0, minY: ys.length ? Math.min(...ys) : 0, maxX: xs.length ? Math.max(...xs) : 1000, maxY: ys.length ? Math.max(...ys) : 1000 },
    zoom: 1,
    pan: { x: 0, y: 0 },
  };
}
