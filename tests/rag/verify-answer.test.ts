import { verifyAnswer } from "@/lib/rag/verify";

describe("verifyAnswer", () => {
  it("should verify a supported answer", () => {
    const answer = "The case Smith v. Jones established that contracts must be clear.";
    const sources = [
      {
        text: "In Smith v. Jones, the court ruled that contractual obligations must be clearly stated.",
        caseId: "case-1",
      },
    ];

    const result = verifyAnswer(answer, sources);
    expect(result.isVerified).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.checkedClaims.length).toBeGreaterThan(0);
  });

  it("should identify unsupported claims", () => {
    const answer = "The case involved space travel regulations on Mars.";
    const sources = [
      {
        text: "A standard contract dispute between two parties.",
        caseId: "case-1",
      },
    ];

    const result = verifyAnswer(answer, sources);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThan(1);
  });

  it("should handle empty answer", () => {
    const result = verifyAnswer("", []);
    expect(result.checkedClaims).toEqual([]);
    expect(result.confidence).toBe(0);
    expect(result.isVerified).toBe(false);
  });

  it("should extract case names from answer", () => {
    const answer = "Smith v. Jones established important precedents.";
    const sources = [
      { text: "The case established precedents.", caseId: "case-1" },
    ];

    const result = verifyAnswer(answer, sources);
    expect(result.checkedClaims.length).toBeGreaterThan(0);
  });

  it("should calculate confidence score", () => {
    const answer = "Contracts must be clear and unambiguous.";
    const sources = [
      {
        text: "The court held that contracts must be clear and unambiguous in their terms.",
        caseId: "case-1",
      },
    ];

    const result = verifyAnswer(answer, sources);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});
