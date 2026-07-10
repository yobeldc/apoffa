import { normalizeURL, getDomain, isValidURL } from "@/lib/normalize-url";

describe("normalizeURL", () => {
  it("should remove trailing slashes", () => {
    expect(normalizeURL("https://example.com/path/")).toBe("https://example.com/path");
  });

  it("should remove tracking parameters", () => {
    const url = "https://example.com/page?utm_source=test&fbclid=123";
    const normalized = normalizeURL(url);
    expect(normalized).not.toContain("utm_source");
    expect(normalized).not.toContain("fbclid");
  });

  it("should keep essential parameters", () => {
    const url = "https://example.com/page?id=123&page=2";
    expect(normalizeURL(url)).toBe(url);
  });
});

describe("getDomain", () => {
  it("should extract domain from URL", () => {
    expect(getDomain("https://www.example.com/path")).toBe("example.com");
  });

  it("should remove www prefix", () => {
    expect(getDomain("https://www.test.org")).toBe("test.org");
  });

  it("should handle invalid URLs", () => {
    expect(getDomain("not-a-url")).toBe("");
  });
});

describe("isValidURL", () => {
  it("should validate correct URLs", () => {
    expect(isValidURL("https://example.com")).toBe(true);
    expect(isValidURL("http://localhost:3000")).toBe(true);
  });

  it("should reject invalid URLs", () => {
    expect(isValidURL("not-a-url")).toBe(false);
    expect(isValidURL("")).toBe(false);
  });
});
