import { calculateMetrics } from "@/lib/rag/eval";
import type { EvalResult } from "@/lib/rag/eval";

describe("calculateMetrics", () => {
  it("should calculate basic metrics", () => {
    const results: EvalResult[] = [
      { question: "Q1", answer: "A1", latencyMs: 100 },
      { question: "Q2", answer: "A2", latencyMs: 200 },
      { question: "Q3", answer: "A3", latencyMs: 300 },
    ];

    const metrics = calculateMetrics(results);

    expect(metrics.total).toBe(3);
    expect(metrics.avgLatencyMs).toBe(200);
    expect(metrics.errorRate).toBe(0);
    expect(metrics.successRate).toBe(1);
  });

  it("should handle errors in results", () => {
    const results: EvalResult[] = [
      { question: "Q1", answer: "A1", latencyMs: 100 },
      { question: "Q2", answer: "Error: something", latencyMs: 50 },
      { question: "Q3", answer: "A3", latencyMs: 200 },
    ];

    const metrics = calculateMetrics(results);

    expect(metrics.total).toBe(3);
    expect(metrics.errorRate).toBeCloseTo(0.333);
    expect(metrics.successRate).toBeCloseTo(0.666);
  });

  it("should handle all errors", () => {
    const results: EvalResult[] = [
      { question: "Q1", answer: "Error: fail", latencyMs: 100 },
    ];

    const metrics = calculateMetrics(results);

    expect(metrics.errorRate).toBe(1);
    expect(metrics.successRate).toBe(0);
  });

  it("should handle empty results", () => {
    const results: EvalResult[] = [];
    const metrics = calculateMetrics(results);

    expect(metrics.total).toBe(0);
    expect(metrics.avgLatencyMs).toBeNaN();
  });
});
