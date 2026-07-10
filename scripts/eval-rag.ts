/**
 * RAG Evaluation Script for Apoffa
 *
 * Evaluates the quality of RAG (Retrieval-Augmented Generation) responses
 * against a golden dataset of questions and expected answers.
 *
 * Usage: npx tsx scripts/eval-rag.ts --dataset <path> [--output <path>]
 */

import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { retrieveAndGenerate } from "../src/lib/rag/pipeline";

config();

interface EvalCase {
  id: string;
  question: string;
  expectedAnswer: string;
  expectedSources: string[];
  difficulty: "easy" | "medium" | "hard";
}

interface EvalResult {
  caseId: string;
  question: string;
  generatedAnswer: string;
  expectedAnswer: string;
  retrievedChunks: string[];
  semanticSimilarity: number;
  sourceCoverage: number;
  latencyMs: number;
  pass: boolean;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
  const args = process.argv.slice(2);
  const datasetPath = args[args.indexOf("--dataset") + 1];
  const outputPath = args[args.indexOf("--output") + 1] || "eval-rag-results.json";

  if (!datasetPath) {
    console.error("Usage: npx tsx scripts/eval-rag.ts --dataset <path> [--output <path>]");
    process.exit(1);
  }

  const dataset: EvalCase[] = JSON.parse(readFileSync(resolve(datasetPath), "utf8"));
  console.log(`Loaded ${dataset.length} evaluation cases\n`);

  const results: EvalResult[] = [];

  for (const testCase of dataset) {
    const start = Date.now();
    const { answer, chunks, abstained } = await retrieveAndGenerate(testCase.question);
    const latencyMs = Date.now() - start;

    // Simple lexical overlap as proxy for semantic similarity
    const generatedWords = new Set(answer.toLowerCase().split(/\s+/));
    const expectedWords = new Set(testCase.expectedAnswer.toLowerCase().split(/\s+/));
    const overlap = [...generatedWords].filter((w) => expectedWords.has(w)).length;
    const semanticSimilarity = overlap / Math.max(generatedWords.size, expectedWords.size);

    // Source coverage
    const retrievedIds = chunks.map((c) => c.caseDecisionId);
    const coveredSources = testCase.expectedSources.filter((s) => retrievedIds.includes(s));
    const sourceCoverage = coveredSources.length / testCase.expectedSources.length;

    const pass = semanticSimilarity > 0.3 && sourceCoverage > 0.5;

    results.push({
      caseId: testCase.id,
      question: testCase.question,
      generatedAnswer: answer,
      expectedAnswer: testCase.expectedAnswer,
      retrievedChunks: retrievedIds,
      semanticSimilarity,
      sourceCoverage,
      latencyMs,
      pass,
    });

    console.log(
      `${pass ? "✓" : "✗"} ${testCase.id} [${testCase.difficulty}] sim=${(semanticSimilarity * 100).toFixed(0)}% src=${(sourceCoverage * 100).toFixed(0)}% ${latencyMs}ms`
    );
  }

  const passed = results.filter((r) => r.pass).length;
  const avgSimilarity = results.reduce((s, r) => s + r.semanticSimilarity, 0) / results.length;
  const avgLatency = results.reduce((s, r) => s + r.latencyMs, 0) / results.length;

  console.log(`\n========================================`);
  console.log(`Results: ${passed}/${results.length} passed`);
  console.log(`Avg similarity: ${(avgSimilarity * 100).toFixed(1)}%`);
  console.log(`Avg latency: ${avgLatency.toFixed(0)}ms`);
  console.log(`========================================`);

  writeFileSync(resolve(outputPath), JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${outputPath}`);
}

main().catch(console.error);
