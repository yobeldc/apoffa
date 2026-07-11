/**
 * Document Extraction Types
 * Shared type definitions for document processing pipeline.
 */

export interface ExtractedDocument {
  id: string
  title: string
  content: string
  source: string
  url?: string
  mimeType: string
  fileSize: number
  metadata: DocumentMetadata
  pages?: ExtractedPage[]
  extractedAt: string
}

export interface ExtractedPage {
  pageNumber: number
  text: string
  wordCount: number
}

export interface DocumentMetadata {
  author?: string
  date?: string
  language: string
  category?: string
  tags: string[]
  pageCount?: number
  wordCount: number
  charCount: number
}

export interface ExtractionOptions {
  extractOCR: boolean
  extractTables: boolean
  normalizeWhitespace: boolean
  removeHeadersFooters: boolean
  detectLanguage: boolean
  chunkSize: number
  chunkOverlap: number
}
