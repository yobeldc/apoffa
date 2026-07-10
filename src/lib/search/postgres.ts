import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'search:postgres' });

export interface SearchOptions {
  query: string;
  filters?: {
    status?: string[];
    priority?: string[];
    dateFrom?: string;
    dateTo?: string;
    createdBy?: string[];
    entityType?: string[];
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Full-text search on cases using PostgreSQL tsvector.
 */
export async function searchCases(options: SearchOptions): Promise<SearchResult<unknown>> {
  const { query, filters, sort, pagination } = options;
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const offset = (page - 1) * pageSize;

  log.info({ query, page, pageSize }, 'Searching cases');

  // Build the WHERE clause
  const whereConditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  // Full-text search on title and description
  if (query && query.trim()) {
    whereConditions.push(`(
      to_tsvector('english', COALESCE(c.title, '')) ||
      to_tsvector('english', COALESCE(c.description, ''))
    ) @@ plainto_tsquery('english', $${paramIdx})`);
    params.push(query.trim());
    paramIdx++;
  }

  // Status filter
  if (filters?.status && filters.status.length > 0) {
    const statusPlaceholders = filters.status.map((_, i) => `$${paramIdx + i}`).join(',');
    whereConditions.push(`c.status IN (${statusPlaceholders})`);
    params.push(...filters.status);
    paramIdx += filters.status.length;
  }

  // Priority filter
  if (filters?.priority && filters.priority.length > 0) {
    const priorityPlaceholders = filters.priority.map((_, i) => `$${paramIdx + i}`).join(',');
    whereConditions.push(`c.priority IN (${priorityPlaceholders})`);
    params.push(...filters.priority);
    paramIdx += filters.priority.length;
  }

  // Date range filter
  if (filters?.dateFrom) {
    whereConditions.push(`c.created_at >= $${paramIdx}`);
    params.push(filters.dateFrom);
    paramIdx++;
  }
  if (filters?.dateTo) {
    whereConditions.push(`c.created_at <= $${paramIdx}`);
    params.push(filters.dateTo);
    paramIdx++;
  }

  // Created by filter
  if (filters?.createdBy && filters.createdBy.length > 0) {
    const cbPlaceholders = filters.createdBy.map((_, i) => `$${paramIdx + i}`).join(',');
    whereConditions.push(`c.created_by IN (${cbPlaceholders})`);
    params.push(...filters.createdBy);
    paramIdx += filters.createdBy.length;
  }

  const whereClause = whereConditions.length > 0
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Sort
  const sortField = sort?.field || 'created_at';
  const sortDirection = sort?.direction || 'desc';
  const allowedSortFields = ['created_at', 'updated_at', 'title', 'status', 'priority'];
  const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'created_at';

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM cases c
    ${whereClause}
  `;

  // Main query
  const mainQuery = `
    SELECT
      c.id,
      c.title,
      c.description,
      c.status,
      c.priority,
      c.created_at,
      c.updated_at,
      c.created_by,
      c.assigned_to,
      u.name as creator_name,
      au.name as assignee_name,
      COUNT(DISTINCT ce.entity_id) as entity_count,
      COUNT(DISTINCT d.id) as document_count
    FROM cases c
    LEFT JOIN users u ON c.created_by = u.id
    LEFT JOIN users au ON c.assigned_to = au.id
    LEFT JOIN case_entities ce ON c.id = ce.case_id
    LEFT JOIN documents d ON c.id = d.case_id
    ${whereClause}
    GROUP BY c.id, u.name, au.name
    ORDER BY c.${safeSortField} ${sortDirection}
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
  `;

  params.push(pageSize, offset);

  try {
    const countResult = await prisma.$queryRawUnsafe<Array<{ total: bigint }>>(countQuery, ...params.slice(0, paramIdx - 1));
    const total = Number(countResult[0]?.total || 0);

    const items = await prisma.$queryRawUnsafe<unknown[]>(mainQuery, ...params);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    log.error({ error, query }, 'Case search failed');
    throw error;
  }
}

/**
 * Search entities by name or type.
 */
export async function searchEntities(
  query: string,
  type?: string,
  pagination?: { page: number; pageSize: number }
): Promise<SearchResult<unknown>> {
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const offset = (page - 1) * pageSize;

  log.info({ query, type, page, pageSize }, 'Searching entities');

  const where: Record<string, unknown> = {};

  if (query && query.trim()) {
    where.name = { contains: query.trim(), mode: 'insensitive' };
  }

  if (type) {
    where.type = type;
  }

  const [items, total] = await Promise.all([
    prisma.entity.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: offset,
      take: pageSize,
      include: {
        _count: {
          select: {
            caseEntities: true,
            sourceRelationships: true,
            targetRelationships: true,
          },
        },
      },
    }),
    prisma.entity.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Advanced search across cases, documents, and entities.
 */
export async function globalSearch(
  query: string,
  pagination?: { page: number; pageSize: number }
): Promise<{
  cases: SearchResult<unknown>;
  documents: SearchResult<unknown>;
  entities: SearchResult<unknown>;
}> {
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 10;

  log.info({ query, page, pageSize }, 'Running global search');

  const [cases, documents, entities] = await Promise.all([
    searchCases({ query, pagination: { page, pageSize } }),
    searchDocuments(query, { page, pageSize }),
    searchEntities(query, undefined, { page, pageSize }),
  ]);

  return { cases, documents, entities };
}

async function searchDocuments(
  query: string,
  pagination: { page: number; pageSize: number }
): Promise<SearchResult<unknown>> {
  const { page, pageSize } = pagination;
  const offset = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (query && query.trim()) {
    where.OR = [
      { title: { contains: query.trim(), mode: 'insensitive' } },
      { content: { contains: query.trim(), mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: pageSize,
      include: {
        case: { select: { id: true, title: true } },
        creator: { select: { id: true, name: true } },
      },
    }),
    prisma.document.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
