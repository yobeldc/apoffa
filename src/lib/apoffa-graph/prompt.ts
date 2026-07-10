/**
 * LLM prompt builders for Apoffa Graph extraction.
 *
 * Centralizes all prompts used in the graph extraction pipeline.
 */

export function buildExtractionPrompt(caseText: string, metadata: {
  nomorPutusan?: string | null;
  pengadilan?: string | null;
  klasifikasi?: string | null;
  tahun?: number | null;
}): string {
  return `You are a legal document analysis assistant specializing in Indonesian court decisions (putusan). Extract structured information from the following court decision text.

METADATA:
- Nomor Putusan: ${metadata.nomorPutusan ?? "N/A"}
- Pengadilan: ${metadata.pengadilan ?? "N/A"}
- Klasifikasi: ${metadata.klasifikasi ?? "N/A"}
- Tahun: ${metadata.tahun ?? "N/A"}

EXTRACTION TASKS:
1. Identify all JUDGES (hakim) mentioned with their roles
2. Identify all LEGAL ISSUES (masalah hukum) discussed
3. Identify all STATUTES (undang-undang) and ARTICLES (pasal) cited
4. Identify all SENTENCES (amar putusan) with their outcomes
5. Extract EVIDENCE SPANS — key quotes supporting each extraction
6. Assess CONFIDENCE for each extracted field (0.0-1.0)

COURT DECISION TEXT:
---
${caseText.slice(0, 8000)}
---

Output as valid JSON matching the ApoffaGraphDecisionExtraction schema.`;
}

export function buildMemoPrompt(extractionJson: string, focusIssues?: string[]): string {
  return `Generate a structured research memo from the following case extraction data.

${focusIssues ? `FOCUS ISSUES: ${focusIssues.join(", ")}` : ""}

EXTRACTION DATA:
${extractionJson}

Generate a concise research memo with:
1. Executive summary
2. Key legal issues and analysis
3. Relevant statutes and articles
4. Case outcome and reasoning
5. Confidence assessment

Format as valid JSON.`;
}

export function buildSimilarityPrompt(caseA: string, caseB: string): string {
  return `Compare the following two Indonesian court decisions and identify similarities and differences.

CASE A:
${caseA.slice(0, 4000)}

CASE B:
${caseB.slice(0, 4000)}

Analyze:
1. Similar legal issues
2. Common statutes cited
3. Comparable outcomes
4. Shared judges or courts
5. Overall similarity score (0.0-1.0)

Output as valid JSON.`;
}
