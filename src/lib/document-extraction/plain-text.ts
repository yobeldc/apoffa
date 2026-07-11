/"use server"

/**
 * Plain Text Extractor
 * Handles extraction from .txt and other plain text files.
 */

export interface PlainTextResult {
  title: string
  content: string
  metadata: {
    lineCount: number
    wordCount: number
    charCount: number
    encoding: string
  }
}

/**
 * Extract content from a plain text file.
 */
export async function extractFromPlainText(
  buffer: ArrayBuffer
): Promise<PlainTextResult> {
  // Try UTF-8 first, fallback to Latin-1
  let content: string
  try {
    content = new TextDecoder("utf-8", { fatal: true }).decode(buffer)
  } catch {
    content = new TextDecoder("iso-8859-1").decode(buffer)
  }

  const lines = content.split("\n")
  const title = lines[0]?.trim() || "Untitled"

  return {
    title,
    content: content.trim(),
    metadata: {
      lineCount: lines.length,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      charCount: content.length,
      encoding: "utf-8",
    },
  }
}
