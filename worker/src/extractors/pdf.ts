/"use server"

/**
 * PDF Extractor
 * Extracts text and metadata from PDF documents.
 * Uses: PDF parsing utilities for server environments.
 *
 * Note: Full PDF parsing requires external libraries.
 * This provides the interface and basic text extraction.
 */

// ── Types ───────────────────────────────────────────────────────────

export interface PDFExtractionOptions {
  extractText: boolean
  extractMetadata: boolean
  extractPages: boolean
  maxPages: number
  maxSize: number
  password?: string
}

export const DEFAULT_PDF_OPTIONS: PDFExtractionOptions = {
  extractText: true,
  extractMetadata: true,
  extractPages: true,
  maxPages: 1000,
  maxSize: 50 * 1024 * 1024, // 50MB
}

export interface PDFExtractionResult {
  title: string
  content: string
  pages: PDFPage[]
  metadata: PDFMetadata
  extractionTime: number
}

export interface PDFPage {
  pageNumber: number
  text: string
  wordCount: number
}

export interface PDFMetadata {
  author?: string
  creator?: string
  producer?: string
  creationDate?: string
  modificationDate?: string
  title?: string
  subject?: string
  keywords?: string[]
  pageCount: number
  fileSize: number
  pdfVersion?: string
  encrypted: boolean
}

// ── Extraction ──────────────────────────────────────────────────────

/**
 * Extract text from PDF buffer.
 * Server-side PDF text extraction.
 */
export async function extractFromPDF(
  pdfBuffer: ArrayBuffer,
  options: Partial<PDFExtractionOptions> = {}
): Promise<PDFExtractionResult> {
  const opts = { ...DEFAULT_PDF_OPTIONS, ...options }
  const startTime = Date.now()

  // Validate
  validatePDF(pdfBuffer, opts)

  // Parse PDF structure and extract text
  const { metadata, pages, fullText } = await parsePDF(pdfBuffer, opts)

  const extractionTime = Date.now() - startTime

  return {
    title: metadata.title || "Untitled Document",
    content: fullText,
    pages,
    metadata: {
      ...metadata,
      fileSize: pdfBuffer.byteLength,
    },
    extractionTime,
  }
}

// ── PDF Parser ──────────────────────────────────────────────────────

/**
 * Parse PDF structure and extract content.
 * Basic implementation for text extraction.
 */
async function parsePDF(
  buffer: ArrayBuffer,
  options: PDFExtractionOptions
): Promise<{
  metadata: PDFMetadata
  pages: PDFPage[]
  fullText: string
}> {
  const uint8 = new Uint8Array(buffer)

  // Check PDF header
  const header = new TextDecoder().decode(uint8.slice(0, 8))
  if (!header.startsWith("%PDF-")) {
    throw new Error("Invalid PDF: missing PDF header")
  }

  const pdfVersion = header.slice(5, 8).trim()

  // Extract text from PDF streams
  // This is a simplified parser - production should use a proper PDF library
  const text = extractTextFromPDFStreams(uint8)

  // Split into pages
  const pageTexts = text.split(/\f|\n---PAGE BREAK---\n/)
  const pages: PDFPage[] = pageTexts
    .map((pageText, i) => ({
      pageNumber: i + 1,
      text: pageText.trim(),
      wordCount: pageText.split(/\s+/).filter(Boolean).length,
    }))
    .filter((p) => p.text.length > 0)
    .slice(0, options.maxPages)

  const fullText = pages.map((p) => p.text).join("\n\n")

  // Extract metadata from trailer
  const metadata = extractPDFMetadata(uint8)

  return {
    metadata: {
      ...metadata,
      pageCount: pages.length,
      pdfVersion,
      fileSize: buffer.byteLength,
      encrypted: false,
    },
    pages,
    fullText,
  }
}

/**
 * Extract text from PDF content streams.
 * Simplified approach - extracts text between BT/ET markers.
 */
function extractTextFromPDFStreams(uint8: Uint8Array): string {
  const decoder = new TextDecoder("utf-8", { fatal: false })
  const fullText = decoder.decode(uint8)

  // Extract text from between BT (Begin Text) and ET (End Text) markers
  const textBlocks: string[] = []
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g

  let match
  while ((match = btRegex.exec(fullText)) !== null) {
    const textBlock = match[1]
    // Extract text between Tj and TJ operators
    const textSegments = textBlock.match(/\(([^)]*)\)\s*Tj|\[([^\]]*)\]\s*TJ/g)
    if (textSegments) {
      for (const segment of textSegments) {
        const text = segment
          .replace(/\(([^)]*)\)\s*Tj/, "$1")
          .replace(/\[([^\]]*)\]\s*TJ/, "$1")
          .replace(/\\(\d{3})/g, (_, octal) =>
            String.fromCharCode(parseInt(octal, 8))
          )
          .replace(/\\\\/g, "\\")
          .replace(/\\\(/g, "(")
          .replace(/\\\)/g, ")")
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
        textBlocks.push(text)
      }
    }
  }

  return textBlocks.join(" ").replace(/\s+/g, " ").trim()
}

/**
 * Extract metadata from PDF trailer/dictionary.
 */
function extractPDFMetadata(uint8: Uint8Array): Partial<PDFMetadata> {
  const text = new TextDecoder().decode(uint8)
  const metadata: Partial<PDFMetadata> = {}

  // Extract common metadata fields
  const extractField = (field: string): string | undefined => {
    const regex = new RegExp(`/${field}\\s*\\(([^)]*)\\)`)
    const match = text.match(regex)
    return match?.[1] || undefined
  }

  metadata.title = extractField("Title")
  metadata.author = extractField("Author")
  metadata.subject = extractField("Subject")
  metadata.creator = extractField("Creator")
  metadata.producer = extractField("Producer")

  const keywordsStr = extractField("Keywords")
  if (keywordsStr) {
    metadata.keywords = keywordsStr.split(",").map((k) => k.trim())
  }

  return metadata
}

// ── Validation ──────────────────────────────────────────────────────

function validatePDF(buffer: ArrayBuffer, options: PDFExtractionOptions): void {
  if (buffer.byteLength > options.maxSize) {
    throw new Error(
      `PDF too large: ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB. Max: ${
        options.maxSize / 1024 / 1024
      }MB`
    )
  }

  const header = new TextDecoder().decode(buffer.slice(0, 8))
  if (!header.startsWith("%PDF-")) {
    throw new Error("Invalid PDF file: missing PDF header signature")
  }
}
