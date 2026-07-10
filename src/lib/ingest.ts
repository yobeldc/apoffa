// src/lib/ingest.ts
// Ingestion job management for bulk case imports

import { prisma } from './db';
import { serialize } from './serialize';

export interface IngestionProgress {
  total: number;
  processed: number;
  failed: number;
  percentage: number;
}

export async function createIngestionJob(data: {
  name: string;
  description?: string;
  source: string;
  sourceUrl?: string;
}) {
  const job = await prisma.ingestionJob.create({
    data: {
      name: data.name,
      description: data.description,
      source: data.source,
      sourceUrl: data.sourceUrl,
      status: 'pending',
    },
  });
  return serialize(job);
}

export async function startIngestionJob(id: string) {
  const job = await prisma.ingestionJob.update({
    where: { id },
    data: {
      status: 'running',
      startedAt: new Date(),
    },
  });
  return serialize(job);
}

export async function updateIngestionProgress(
  id: string,
  progress: IngestionProgress
) {
  const job = await prisma.ingestionJob.update({
    where: { id },
    data: {
      totalItems: progress.total,
      processedItems: progress.processed,
      failedItems: progress.failed,
    },
  });
  return serialize(job);
}

export async function completeIngestionJob(id: string, caseIds: string[]) {
  const job = await prisma.ingestionJob.update({
    where: { id },
    data: {
      status: 'completed',
      completedAt: new Date(),
      cases: JSON.stringify(caseIds),
    },
  });
  return serialize(job);
}

export async function failIngestionJob(id: string, error: string) {
  const job = await prisma.ingestionJob.update({
    where: { id },
    data: {
      status: 'failed',
      completedAt: new Date(),
      logs: JSON.stringify([{ error, timestamp: new Date().toISOString() }]),
    },
  });
  return serialize(job);
}

export async function stopIngestionJob(id: string) {
  const job = await prisma.ingestionJob.update({
    where: { id },
    data: {
      status: 'stopped',
      completedAt: new Date(),
    },
  });
  return serialize(job);
}

export async function getIngestionJobs(status?: string) {
  const where = status ? { status } : {};
  const jobs = await prisma.ingestionJob.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return serialize(jobs);
}

export async function getIngestionJob(id: string) {
  const job = await prisma.ingestionJob.findUnique({
    where: { id },
  });
  return job ? serialize(job) : null;
}
