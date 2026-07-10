/**
 * Research memo generation for Apoffa Graph.
 *
 * Generates structured research memos from extracted case data.
 */

import type { ApoffaGraphDecisionExtraction } from "./schema";
import { prisma } from "../db";
import { buildMemoPrompt } from "./prompt";

export interface MemoOptions {
  caseDecisionIds: string[];
  includeSimilarCases?: boolean;
  includeTrends?: boolean;
  focusIssues?: string[];
}

export interface ResearchMemo {
  title: string;
  generatedAt: string;
  disclaimer: string;
  sections: Array<{
    heading: string;
    content: string;
    sourceCaseIds: string[];
    confidence: number;
  }>;
  citations: Array<{
    caseId: string;
    nomorPutusan: string | null;
    sourceUrl: string;
    field: string;
    quote: string | null;
  }>;
  confidenceWarnings: string[];
}

/**
 * Generate a research memo from extracted case data.
 */
export async function generateResearchMemo(options: MemoOptions): Promise<ResearchMemo> {
  const extractions = await prisma.apoffaGraphExtraction.findMany({
    where: { caseDecisionId: { in: options.caseDecisionIds } },
    include: {
      caseDecision: {
        select: { nomorPutusan: true, sourceUrl: true },
      },
    },
  });

  const parsedExtractions: ApoffaGraphDecisionExtraction[] = extractions.map((e) =>
    JSON.parse(e.fullJson)
  );

  const sections: ResearchMemo["sections"] = [];
  const citations: ResearchMemo["citations"] = [];
  const confidenceWarnings: string[] = [];

  // Overview section
  sections.push({
    heading: "Overview",
    content: `Analysis covers ${parsedExtractions.length} case(s).`,
    sourceCaseIds: options.caseDecisionIds,
    confidence: 1.0,
  });

  // Build citation index
  for (const e of extractions) {
    const parsed = JSON.parse(e.fullJson);
    if (parsed.evidence_spans) {
      for (const span of parsed.evidence_spans) {
        citations.push({
          caseId: e.caseDecisionId,
          nomorPutusan: e.caseDecision.nomorPutusan,
          sourceUrl: e.caseDecision.sourceUrl ?? "",
          field: span.target_path,
          quote: span.quote,
        });
      }
    }
  }

  // Check for low-confidence extractions
  for (const ex of parsedExtractions) {
    const avgConfidence =
      Object.values(ex.extraction_confidence ?? {}).reduce((a, b) => a + b, 0) /
      Math.max(Object.keys(ex.extraction_confidence ?? {}).length, 1);
    if (avgConfidence < 0.5) {
      confidenceWarnings.push(
        `Low average confidence (${(avgConfidence * 100).toFixed(0)}%) for case ${ex.nomor_putusan ?? ex.case_decision_id}`
      );
    }
  }

  return {
    title: `Research Memo — ${parsedExtractions.length} Cases`,
    generatedAt: new Date().toISOString(),
    disclaimer:
      "This memo was generated automatically from extracted case data. It does not constitute legal advice. Always verify against original sources.",
    sections,
    citations,
    confidenceWarnings,
  };
}
