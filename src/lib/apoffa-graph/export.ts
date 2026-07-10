/**
 * Export utilities for Apoffa Graph.
 *
 * Supports CSV and JSON export of extracted case data.
 */

import { prisma } from "../db";

export interface ExportFilters {
  klasifikasi?: string;
  tahunMin?: number;
  tahunMax?: number;
  pengadilan?: string;
  status?: string;
}

/**
 * Export Apoffa Graph data to CSV format.
 */
export async function exportApoffaGraphToCsv(filters: ExportFilters): Promise<{
  csv: string;
  filename: string;
  rowCount: number;
}> {
  const where: Record<string, unknown> = {};
  if (filters.status) where.apoffaGraphStatus = filters.status;

  const cases = await prisma.caseDecision.findMany({
    where,
    include: {
      apoffaGraphExtraction: true,
      decisionJudges: { include: { judge: true } },
      decisionLegalIssues: { include: { legalIssue: true } },
      decisionArticles: { include: { statuteArticle: { include: { statute: true } } } },
      sentences: true,
    },
    take: 1000,
  });

  // Build CSV header
  const headers = [
    "case_decision_id",
    "nomor_putusan",
    "pengadilan",
    "klasifikasi",
    "tahun",
    "status",
    "extraction_method",
    "judge_count",
    "issue_count",
    "article_count",
    "sentence_count",
  ];

  const rows = cases.map((c) => [
    c.id,
    c.nomorPutusan ?? "",
    c.pengadilan ?? "",
    c.klasifikasi ?? "",
    String(c.tahun ?? ""),
    c.apoffaGraphStatus,
    c.apoffaGraphExtraction?.extractionMethod ?? "",
    String(c.decisionJudges.length),
    String(c.decisionLegalIssues.length),
    String(c.decisionArticles.length),
    String(c.sentences?.length ?? 0),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '\\"')}"`).join(","))].join("\n");

  return {
    csv,
    filename: `apoffa-graph-export-${new Date().toISOString().slice(0, 10)}.csv`,
    rowCount: cases.length,
  };
}

/**
 * Export Apoffa Graph data to JSON format.
 */
export async function exportApoffaGraphToJson(filters: ExportFilters): Promise<{
  json: string;
  filename: string;
  rowCount: number;
}> {
  const where: Record<string, unknown> = {};
  if (filters.status) where.apoffaGraphStatus = filters.status;

  const cases = await prisma.caseDecision.findMany({
    where,
    include: {
      apoffaGraphExtraction: true,
      decisionJudges: { include: { judge: true } },
      decisionLegalIssues: { include: { legalIssue: true } },
      decisionArticles: { include: { statuteArticle: { include: { statute: true } } } },
      sentences: true,
    },
    take: 1000,
  });

  const json = JSON.stringify(cases, null, 2);

  return {
    json,
    filename: `apoffa-graph-export-${new Date().toISOString().slice(0, 10)}.json`,
    rowCount: cases.length,
  };
}
