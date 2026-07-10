// src/lib/document-extraction/plain-text.ts
// Plain text document handling

export function extractTextFromPlainText(content: string): string {
  // Clean up common encoding issues
  let text = content
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove null bytes
    .replace(/\x00/g, '');

  // Detect and handle UTF-8 BOM
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  return text.trim();
}

export function isPlainText(content: string): boolean {
  // Check if content is mostly printable characters
  const printableRatio =
    content.split('').filter((c) => {
      const code = c.charCodeAt(0);
      return code >= 32 && code < 127 || code === 9 || code === 10 || code === 13;
    }).length / content.length;

  return printableRatio > 0.95;
}
