#!/usr/bin/env tsx
/**
 * OpenSearch indexing script.
 */
import { Client } from '@opensearch-project/opensearch';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'index-opensearch' });

function getClient(): Client {
  const node = process.env.OPENSEARCH_URL;
  if (!node) throw new Error('OPENSEARCH_URL not configured');
  return new Client({ node, auth: { username: process.env.OPENSEARCH_USERNAME || 'admin', password: process.env.OPENSEARCH_PASSWORD || 'admin' } });
}

async function setupIndices(c: Client) {
  for (const [name, idx] of Object.entries({ cases: 'apoffa-cases', documents: 'apoffa-documents', entities: 'apoffa-entities' })) {
    const exists = await c.indices.exists({ index: idx });
    if (!exists.body) {
      await c.indices.create({ index: idx, body: { mappings: { properties: { name: { type: 'text' }, title: { type: 'text' }, content: { type: 'text' }, type: { type: 'keyword' }, createdAt: { type: 'date' } } } } });
      log.info({ index: idx }, 'Created');
    }
  }
}

async function indexAll(c: Client) {
  const [cases, docs, entities] = await Promise.all([
    prisma.case.findMany(),
    prisma.document.findMany(),
    prisma.entity.findMany(),
  ]);

  const idx = (n: string, i: string, d: object) => [{ index: { _index: n, _id: i } }, d];
  const body = [
    ...cases.flatMap(x => idx('apoffa-cases', x.id, { title: x.title, description: x.description, status: x.status, priority: x.priority, createdAt: x.createdAt.toISOString() })),
    ...docs.flatMap(x => idx('apoffa-documents', x.id, { title: x.title, content: x.content, type: x.type, createdAt: x.createdAt.toISOString() })),
    ...entities.flatMap(x => idx('apoffa-entities', x.id, { name: x.name, type: x.type, createdAt: x.createdAt.toISOString() })),
  ];

  if (body.length) await c.bulk({ body });
  await c.indices.refresh({ index: ['apoffa-cases', 'apoffa-documents', 'apoffa-entities'] });
  log.info({ cases: cases.length, docs: docs.length, entities: entities.length }, 'Indexed');
}

async function main() {
  const c = getClient();
  const h = await c.cluster.health();
  log.info({ status: h.body.status }, 'Cluster health');
  await setupIndices(c);
  await indexAll(c);
}

main().catch(e => { log.fatal(e); process.exit(1); });
