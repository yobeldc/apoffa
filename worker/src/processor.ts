/"use client"

import { useState, useCallback } from "react"

/**
 * Document Processor Types and Utilities
 * Handles: Document processing steps - extraction, transformation, chunking.
 */

// ── Types ───────────────────────────────────────────────────────────

export interface ProcessedDocument {
  id: string
  title: string
  content: string
  chunks: DocumentChunk[]
  metadata: DocumentMetadata
  source: string
  url?: string
  processingTime: number
}

export interface DocumentChunk {
  id: string
  content: string
  index: number
  tokenCount: number
  startOffset: number
  endOffset: number
}

export interface DocumentMetadata {
  author?: string
  date?: string
  category?: string
  tags: string[]
  language: string
  pageCount?: number
  wordCount: number
  charCount: number
}

export interface ProcessingOptions {
  extractOCR: boolean
  extractTables: boolean
  normalizeWhitespace: boolean
  removeHeadersFooters: boolean
  chunkSize: number
  chunkOverlap: number
  minChunkSize: number
  detectLanguage: boolean
}

export const DEFAULT_PROCESSING_OPTIONS: ProcessingOptions = {
  extractOCR: true,
  extractTables: true,
  normalizeWhitespace: true,
  removeHeadersFooters: true,
  chunkSize: 512,
  chunkOverlap: 50,
  minChunkSize: 100,
  detectLanguage: true,
}

// ── Document Chunker ────────────────────────────────────────────────

/**
 * Chunk text into overlapping segments for embedding.
 * Uses: Recursive character-based splitting with semantic boundaries.
 */
export function chunkDocument(
  text: string,
  options: Pick<
    ProcessingOptions,
    "chunkSize" | "chunkOverlap" | "minChunkSize"
  >
): DocumentChunk[] {
  const { chunkSize, chunkOverlap, minChunkSize } = options
  const chunks: DocumentChunk[] = []

  // Split on semantic boundaries (paragraphs, then sentences)
  const paragraphs = text.split(/\n\s*\n/)
  let currentChunk = ""
  let currentStart = 0
  let chunkIndex = 0

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim()
    if (!trimmedParagraph) continue

    // If adding this paragraph exceeds chunk size, finalize current chunk
    if (
      currentChunk.length + trimmedParagraph.length > chunkSize &&
      currentChunk.length >= minChunkSize
    ) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        index: chunkIndex,
        tokenCount: estimateTokenCount(currentChunk),
        startOffset: currentStart,
        endOffset: currentStart + currentChunk.length,
      })
      chunkIndex++

      // Start new chunk with overlap
      const overlapStart = Math.max(0, currentChunk.length - chunkOverlap)
      currentChunk = currentChunk.slice(overlapStart) + "\n\n" + trimmedParagraph
      currentStart += overlapStart
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmedParagraph
    }
  }

  // Finalize last chunk if it meets minimum size
  if (currentChunk.length >= minChunkSize) {
    chunks.push({
      id: `chunk-${chunkIndex}`,
      content: currentChunk.trim(),
      index: chunkIndex,
      tokenCount: estimateTokenCount(currentChunk),
      startOffset: currentStart,
      endOffset: currentStart + currentChunk.length,
    })
  }

  return chunks
}

/**
 * Estimate token count from character count.
 * Rough heuristic: ~4 characters per token for English.
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Normalize text: remove extra whitespace, normalize newlines.
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/**
 * Detect language from text sample.
 * Simple heuristic-based detection.
 */
export function detectLanguage(text: string): string {
  // Simple detection based on character patterns
  const sample = text.slice(0, 1000)

  // Indonesian/Malay common words
  const idPatterns =
    /\b(yang|dan|di|dari|untuk|dengan|pada|adalah|oleh|ini|itu|sebagai|atau|tersebut|bahwa|merupakan|telah|akan|oleh)\b/gi
  const idMatches = (sample.match(idPatterns) || []).length

  // English common words
  const enPatterns =
    /\b(the|and|of|to|in|a|is|that|for|it|with|as|was|on|be|by|at|or|from)\b/gi
  const enMatches = (sample.match(enPatterns) || []).length

  if (idMatches > enMatches) return "id"
  if (enMatches > 2) return "en"
  return "unknown"
}

// ── Processing Hook ─────────────────────────────────────────────────

export function useDocumentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const processDocument = useCallback(
    async (
      file: File,
      options: ProcessingOptions = DEFAULT_PROCESSING_OPTIONS
    ): Promise<ProcessedDocument | null> => {
      setIsProcessing(true)
      setProgress(0)
      setError(null)

      const startTime = Date.now()

      try {
        // Read file
        setProgress(10)
        const text = await readFileAsText(file)

        // Normalize
        setProgress(30)
        const normalizedText = options.normalizeWhitespace
          ? normalizeText(text)
          : text

        // Detect language
        setProgress(40)
        const language = options.detectLanguage
          ? detectLanguage(normalizedText)
          : "en"

        // Chunk
        setProgress(60)
        const chunks = chunkDocument(normalizedText, options)

        // Build metadata
        setProgress(80)
        const metadata: DocumentMetadata = {
          language,
          tags: [],
          wordCount: normalizedText.split(/\s+/).length,
          charCount: normalizedText.length,
        }

        setProgress(100)

        return {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          content: normalizedText,
          chunks,
          metadata,
          source: "upload",
          processingTime: Date.now() - startTime,
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Processing failed")
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    []
  )

  return { processDocument, isProcessing, progress, error }
}

/**
 * Read a file as text.
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(String(e.target?.result || ""))
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}
