import { extractTextFromHTML } from "@/lib/document-extraction/html-text";
import { extractTextFromPlainText } from "@/lib/document-extraction/plain-text";

describe("extractTextFromHTML", () => {
  it("should remove HTML tags", () => {
    const html = "<p>Hello World</p>";
    expect(extractTextFromHTML(html)).toBe("Hello World");
  });

  it("should handle nested tags", () => {
    const html = "<div><p>First</p><p>Second</p></div>";
    const result = extractTextFromHTML(html);
    expect(result).toContain("First");
    expect(result).toContain("Second");
  });

  it("should remove script tags", () => {
    const html = `<p>Content</p><script>alert('x')</script>`;
    expect(extractTextFromHTML(html)).not.toContain("script");
  });

  it("should remove style tags", () => {
    const html = `<p>Content</p><style>.x { color: red; }</style>`;
    expect(extractTextFromHTML(html)).not.toContain("style");
  });

  it("should decode HTML entities", () => {
    const html = "<p>Tom &amp; Jerry</p>";
    expect(extractTextFromHTML(html)).toContain("Tom & Jerry");
  });
});

describe("extractTextFromPlainText", () => {
  it("should return clean text", () => {
    const text = "Hello World";
    expect(extractTextFromPlainText(text)).toBe("Hello World");
  });

  it("should normalize line endings", () => {
    const text = "Line 1\r\nLine 2\rLine 3";
    const result = extractTextFromPlainText(text);
    expect(result).not.toContain("\r");
  });

  it("should remove null bytes", () => {
    const text = "Hello\x00World";
    expect(extractTextFromPlainText(text)).not.toContain("\x00");
  });

  it("should handle BOM", () => {
    const text = "\ufeffHello";
    expect(extractTextFromPlainText(text)).toBe("Hello");
  });
});
