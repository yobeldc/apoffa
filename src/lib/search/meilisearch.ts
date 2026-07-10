/**
 * Meilisearch integration for full-text search.
 */

import { MeiliSearch } from 'meilisearch';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'search:meilisearch' });

let client: MeiliSearch | null = null;

function getClient(): MeiliSearch {
  if (!client) {
    const host = process.env.MEILISEARCH_HOST;
    if (!host) throw new Error('MEILISEARCH_HOST not configured');
    client = new MeiliSearch({ host, apiKey: process.env.MEILISEARCH_API_KEY });
  }
  return client;
}

export async function setupMeilisearch(): Promise<void> {
  log.info('Setting up');
  const ms = getClient();
  for (const [idx, settings] of Object.entries({
    cases: { searchableAttributes: ['title', 'description'], filterableAttributes: ['status', 'priority'], sortableAttributes: ['createdAt'] },
    documents: { searchableAttributes: ['title', 'content'], filterableAttributes: ['type', 'caseId'], sortableAttributes: ['createdAt'] },
    entities: { searchableAttributes: ['name', 'type'], filterableAttributes: ['type'], sortableAttributes: ['createdAt'] },
  })) {
    await ms.index(idx).updateSettings(settings);
  }
  log.info('Setup complete');
}

export async function indexCase(c: { id: string; title: string; description?: string | null; status: string; priority: string; createdAt: Date }): Promise<void> {
  await getClient().index('cases').addDocuments([{ ...c, createdAt: c.createdAt.toISOString() }]);
}

export async function indexDocument(d: { id: string; title: string; content?: string | null; type: string; caseId?: string | null; createdAt: Date }): Promise<void> {
  await getClient().index('documents').addDocuments([{ ...d, createdAt: d.createdAt.toISOString() }]);
}

export async function indexEntity(e: { id: string; name: string; type: string; createdAt: Date }): Promise<void> {
  await getClient().index('entities').addDocuments([{ ...e, createdAt: e.createdAt.toISOString() }]);
}

export async function searchAll(query: string, limit = 20) {
  const ms = getClient();
  const [cases, documents, entities] = await Promise.all([
    ms.index('cases').search(query, { limit }),
    ms.index('documents').search(query, { limit }),
    ms.index('entities').search(query, { limit }),
  ]);
  return { cases, documents, entities };
}
