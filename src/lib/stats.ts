// src/lib/stats.ts
// Statistics and analytics for the case database

import { prisma } from './db';
import { serialize } from './serialize';

export async function getDashboardStats() {
  const [
    totalCases,
    totalIndexed,
    totalSaved,
    recentCases,
    yearDistribution,
    qualityDistribution,
  ] = await Promise.all([
    prisma.case.count(),
    prisma.case.count({ where: { indexedAt: { not: null } } }),
    prisma.savedCase.count(),
    prisma.case.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        year: true,
        court: true,
        createdAt: true,
      },
    }),
    prisma.case.groupBy({
      by: ['year'],
      _count: { id: true },
      orderBy: { year: 'desc' },
      where: { year: { not: null } },
      take: 10,
    }),
    prisma.case.groupBy({
      by: ['dataQuality'],
      _count: { id: true },
    }),
  ]);

  return serialize({
    totalCases,
    totalIndexed,
    totalSaved,
    recentCases,
    yearDistribution,
    qualityDistribution,
  });
}

export async function getIngestionStats() {
  const [
    totalJobs,
    pendingJobs,
    runningJobs,
    completedJobs,
    failedJobs,
  ] = await Promise.all([
    prisma.ingestionJob.count(),
    prisma.ingestionJob.count({ where: { status: 'pending' } }),
    prisma.ingestionJob.count({ where: { status: 'running' } }),
    prisma.ingestionJob.count({ where: { status: 'completed' } }),
    prisma.ingestionJob.count({ where: { status: 'failed' } }),
  ]);

  return serialize({
    totalJobs,
    pendingJobs,
    runningJobs,
    completedJobs,
    failedJobs,
  });
}
