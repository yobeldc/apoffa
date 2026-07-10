// src/lib/case.ts
// Case-related database operations and helpers

import { prisma } from './db';
import { serialize } from './serialize';

export async function getCaseById(id: string) {
  const case_ = await prisma.case.findUnique({
    where: { id },
    include: {
      breakdown: true,
      paragraphs: {
        orderBy: { number: 'asc' },
      },
      citations: true,
    },
  });
  return case_ ? serialize(case_) : null;
}

export async function getCases(options: {
  skip?: number;
  take?: number;
  orderBy?: 'date' | 'createdAt' | 'title';
  order?: 'asc' | 'desc';
} = {}) {
  const { skip = 0, take = 50, orderBy = 'createdAt', order = 'desc' } = options;
  
  const cases = await prisma.case.findMany({
    skip,
    take,
    orderBy: { [orderBy]: order },
    include: {
      breakdown: true,
    },
  });
  
  return serialize(cases);
}

export async function searchCases(query: string) {
  const cases = await prisma.case.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { parties: { contains: query, mode: 'insensitive' } },
        { court: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 50,
    orderBy: { createdAt: 'desc' },
  });
  
  return serialize(cases);
}

export async function getCasesByYear(year: number) {
  const cases = await prisma.case.findMany({
    where: { year },
    orderBy: { createdAt: 'desc' },
  });
  return serialize(cases);
}

export async function getCaseStats() {
  const [total, byYear, byCourt, byType] = await Promise.all([
    prisma.case.count(),
    prisma.case.groupBy({
      by: ['year'],
      _count: { id: true },
      orderBy: { year: 'desc' },
    }),
    prisma.case.groupBy({
      by: ['court'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.case.groupBy({
      by: ['caseType'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ]);
  
  return serialize({ total, byYear, byCourt, byType });
}
