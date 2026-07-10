// src/lib/search.ts
// Search functionality with filtering and ranking

import { prisma } from './db';
import { serialize } from './serialize';

export interface SearchFilters {
  year?: number;
  court?: string;
  caseType?: string;
  dataQuality?: string;
  sourceName?: string;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  skip?: number;
  take?: number;
}

export async function searchCasesAdvanced(options: SearchOptions) {
  const { query, filters = {}, skip = 0, take = 50 } = options;
  
  const where: any = {
    AND: [
      {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { parties: { contains: query, mode: 'insensitive' } },
          { court: { contains: query, mode: 'insensitive' } },
        ],
      },
    ],
  };
  
  if (filters.year) {
    where.AND.push({ year: filters.year });
  }
  if (filters.court) {
    where.AND.push({ court: { contains: filters.court, mode: 'insensitive' } });
  }
  if (filters.caseType) {
    where.AND.push({ caseType: filters.caseType });
  }
  if (filters.dataQuality) {
    where.AND.push({ dataQuality: filters.dataQuality });
  }
  if (filters.sourceName) {
    where.AND.push({ sourceName: filters.sourceName });
  }
  
  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.case.count({ where }),
  ]);
  
  return serialize({ cases, total, page: Math.floor(skip / take) + 1, pageSize: take });
}

export async function getCourts() {
  const courts = await prisma.case.groupBy({
    by: ['court'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    where: { court: { not: null } },
    take: 50,
  });
  return serialize(courts);
}

export async function getYears() {
  const years = await prisma.case.groupBy({
    by: ['year'],
    _count: { id: true },
    orderBy: { year: 'desc' },
    where: { year: { not: null } },
  });
  return serialize(years);
}
