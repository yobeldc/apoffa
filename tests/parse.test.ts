import { parseCaseText, parseCasePDF } from "@/lib/parse";

describe("parseCaseText", () => {
  const sampleCase = `
Smith v. Jones
Court: High Court
Date: 15 June 2023
Judges: Justice Smith
Parties: Smith v. Jones

This case concerns the interpretation of contractual obligations between parties.

The plaintiff, Smith, alleged that Jones breached their agreement.

The court found in favor of Smith, establishing clear precedents.
  `;

  it("should extract title from first line", () => {
    const result = parseCaseText(sampleCase);
    expect(result.title).toBe("Smith v. Jones");
  });

  it("should extract court information", () => {
    const result = parseCaseText(sampleCase);
    expect(result.court).toBe("High Court");
  });

  it("should extract date", () => {
    const result = parseCaseText(sampleCase);
    expect(result.date).toBeDefined();
  });

  it("should extract judges", () => {
    const result = parseCaseText(sampleCase);
    expect(result.judges).toBe("Justice Smith");
  });

  it("should extract parties", () => {
    const result = parseCaseText(sampleCase);
    expect(result.parties).toBe("Smith v. Jones");
  });

  it("should extract year", () => {
    const result = parseCaseText(sampleCase);
    expect(result.year).toBe(2023);
  });

  it("should split into paragraphs", () => {
    const result = parseCaseText(sampleCase);
    expect(result.paragraphs?.length).toBeGreaterThan(0);
  });

  it("should handle empty text", () => {
    const result = parseCaseText("");
    expect(result.content).toBe("");
    expect(result.paragraphs).toEqual([]);
  });
});

describe("parseCasePDF", () => {
  it("should parse PDF text similar to plain text", () => {
    const text = "Case Title\n\nSome content here.";
    const result = parseCasePDF(text);
    expect(result.title).toBe("Case Title");
    expect(result.content).toBe(text);
  });
});
