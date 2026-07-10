import { identifySections, extractHeadings } from "@/lib/legal/sections";

describe("identifySections", () => {
  it("should identify paragraphs", () => {
    const text = "This is a paragraph.\n\nThis is another paragraph.";
    const sections = identifySections(text);
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[0].type).toBe("paragraph");
  });

  it("should identify headings", () => {
    const text = "BACKGROUND\n\nThis is the background section.";
    const sections = identifySections(text);
    const headings = sections.filter((s) => s.type === "heading");
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should identify list items", () => {
    const text = "1. First item\n2. Second item";
    const sections = identifySections(text);
    const lists = sections.filter((s) => s.type === "list");
    expect(lists.length).toBeGreaterThan(0);
  });

  it("should handle empty text", () => {
    const sections = identifySections("");
    expect(sections).toEqual([]);
  });
});

describe("extractHeadings", () => {
  it("should extract all headings", () => {
    const text = `INTRODUCTION

Some intro text.

BACKGROUND

Some background text.

CONCLUSION

Final text.`;

    const headings = extractHeadings(text);
    expect(headings.length).toBe(3);
    expect(headings[0].text).toBe("INTRODUCTION");
    expect(headings[1].text).toBe("BACKGROUND");
    expect(headings[2].text).toBe("CONCLUSION");
  });

  it("should return empty array for no headings", () => {
    const text = "Just a paragraph. Another sentence.";
    const headings = extractHeadings(text);
    expect(headings).toEqual([]);
  });
});
