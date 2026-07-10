import { chunkByParagraphs, chunkByFixedSize } from "@/lib/rag/chunk";

describe("chunkByParagraphs", () => {
  const caseText = `
First paragraph of the case. It contains some important information.

Second paragraph with different content. More details here.

Third paragraph with even more information about the case.
  `;

  it("should split text into chunks", () => {
    const chunks = chunkByParagraphs("case-1", caseText);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("should include metadata in chunks", () => {
    const chunks = chunkByParagraphs("case-1", caseText);
    expect(chunks[0].metadata.caseId).toBe("case-1");
  });

  it("should assign unique IDs to chunks", () => {
    const chunks = chunkByParagraphs("case-1", caseText);
    const ids = chunks.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should split long paragraphs", () => {
    const longText = "A ".repeat(2000);
    const chunks = chunkByParagraphs("case-1", longText, 1000, 100);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("should respect maxChunkSize parameter", () => {
    const chunks = chunkByParagraphs("case-1", caseText, 50);
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(50 + 100); // Allow overlap
    }
  });
});

describe("chunkByFixedSize", () => {
  const longText = "Word ".repeat(500);

  it("should create fixed-size chunks", () => {
    const chunks = chunkByFixedSize("case-1", longText, 200);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("should have overlapping content", () => {
    const chunks = chunkByFixedSize("case-1", longText, 200, 50);
    if (chunks.length > 1) {
      const firstChunkEnd = chunks[0].text.slice(-50);
      const secondChunkStart = chunks[1].text.slice(0, 50);
      expect(secondChunkStart).toContain(firstChunkEnd.trim().split(" ").pop());
    }
  });

  it("should include caseId in metadata", () => {
    const chunks = chunkByFixedSize("case-1", longText);
    expect(chunks[0].metadata.caseId).toBe("case-1");
  });
});
