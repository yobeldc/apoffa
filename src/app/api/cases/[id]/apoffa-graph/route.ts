import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { loadGraphLayout } from '@/lib/apoffa-graph/persist';

const log = logger.child({ module: 'api:apoffa-graph' });

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const caseId = params.id;
    const case_ = await prisma.case.findFirst({
      where: { id: caseId, OR: [{ createdBy: session.user.id }, { assignedTo: session.user.id }] },
    });
    if (!case_) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const layout = await loadGraphLayout(caseId);
    return NextResponse.json(layout || { nodes: [], edges: [] });
  } catch (error) {
    log.error({ error, caseId: params.id }, 'GET failed');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const caseId = params.id;
    const case_ = await prisma.case.findFirst({
      where: { id: caseId, OR: [{ createdBy: session.user.id }, { assignedTo: session.user.id }] },
      include: { documents: true },
    });
    if (!case_) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const fullText = case_.documents.map(d => `${d.title}\n${d.content || ''}`).join('\n\n');
    const { extractEntities, extractRelationships, persistExtraction } = await import('@/lib/apoffa-graph/extract');
    const entities = await extractEntities(fullText, caseId);
    const relationships = await extractRelationships(fullText, entities, caseId);
    await persistExtraction(caseId, entities, relationships);
    await prisma.caseHistory.create({ data: { caseId, event: 'entity_extraction', details: `Extracted ${entities.length} entities, ${relationships.length} relationships`, createdBy: session.user.id } });
    return NextResponse.json({ success: true, entities: entities.length, relationships: relationships.length });
  } catch (error) {
    log.error({ error, caseId: params.id }, 'POST failed');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
