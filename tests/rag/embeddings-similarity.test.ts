import { cosineSimilarity } from "@/lib/rag/embeddings";

describe("cosineSimilarity", () => {
  it("should return 1 for identical vectors", () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    expect(cosineSimilarity(a, b)).toBeCloseTo(1);
  });

  it("should return 0 for orthogonal vectors", () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0);
  });

  it("should return -1 for opposite vectors", () => {
    const a = [1, 0, 0];
    const b = [-1, 0, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1);
  });

  it("should handle zero vectors", () => {
    const a = [0, 0, 0];
    const b = [1, 2, 3];
    expect(cosineSimilarity(a, b)).toBeNaN();
  });

  it("should handle different magnitudes", () => {
    const a = [1, 1, 1];
    const b = [2, 2, 2];
    expect(cosineSimilarity(a, b)).toBeCloseTo(1);
  });

  it("should handle realistic embedding dimensions", () => {
    const a = Array(1536).fill(0).map(() => Math.random());
    const b = Array(1536).fill(0).map(() => Math.random());
    const similarity = cosineSimilarity(a, b);
    expect(similarity).toBeGreaterThanOrEqual(-1);
    expect(similarity).toBeLessThanOrEqual(1);
  });
});
