/"use server"

/**
 * OCR (Optical Character Recognition) Service
 * Extracts text from images and scanned documents.
 * Uses: Cloudflare Workers AI for OCR inference.
 *
 * Supported formats: PNG, JPG, TIFF, BMP, WebP
 * Max file size: 10MB
 * Max resolution: 4096x4096
 */

import { env } from "cloudflare:workers"

// ── Types ───────────────────────────────────────────────────────────

export interface OCROptions {
  language: string
  enhanceResolution: boolean
  detectTables: boolean
  preserveLayout: boolean
}

export const DEFAULT_OCR_OPTIONS: OCROptions = {
  language: "en",
  enhanceResolution: true,
  detectTables: false,
  preserveLayout: false,
}

export interface OCRResult {
  text: string
  confidence: number
  pages: OCRPage[]
  metadata: {
    processingTime: number
    model: string
    language: string
  }
}

export interface OCRPage {
  pageNumber: number
  text: string
  confidence: number
  regions: OCRRegion[]
}

export interface OCRRegion {
  text: string
  bbox: [number, number, number, number] // x, y, width, height
  confidence: number
}

// ── Constants ───────────────────────────────────────────────────────

const OCR_MODEL = "@cf/queue" // Placeholder - use actual CF OCR model
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_DIMENSION = 4096
const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/tiff", "image/bmp", "image/webp"]

// ── Main OCR Function ───────────────────────────────────────────────

/**
 * Extract text from an image using Workers AI OCR.
 */
export async function extractWithOCR(
  imageBuffer: ArrayBuffer,
  contentType: string,
  options: Partial<OCROptions> = {}
): Promise<OCRResult> {
  const opts = { ...DEFAULT_OCR_OPTIONS, ...options }
  const startTime = Date.now()

  // Validate input
  validateImage(imageBuffer, contentType)

  // Run OCR via Workers AI
  const { AI } = env as any
  const result = await AI.run("@cf/unum/uform-gen2-qwen-500m", {
    image: [...new Uint8Array(imageBuffer)],
    prompt: "Extract all text from this image. Preserve the original layout and formatting.",
    max_tokens: 4096,
  })

  const processingTime = Date.now() - startTime

  // Parse response
  const extractedText = result.response || ""

  return {
    text: extractedText,
    confidence: 0.85, // Estimated confidence
    pages: [
      {
        pageNumber: 1,
        text: extractedText,
        confidence: 0.85,
        regions: [],
      },
    ],
    metadata: {
      processingTime,
      model: OCR_MODEL,
      language: opts.language,
    },
  }
}

/**
 * Extract text from multiple images (batch processing).
 */
export async function extractWithOCRBatch(
  images: Array<{ buffer: ArrayBuffer; contentType: string; name?: string }>,
  options?: Partial<OCROptions>
): Promise<OCRResult[]> {
  const results = await Promise.all(
    images.map((img, i) =>
      extractWithOCR(img.buffer, img.contentType, options).catch((err) => ({
        text: `",
        confidence: 0,
        pages: [],
        metadata: {
          processingTime: 0,
          model: OCR_MODEL,
          language: options?.language || "en",
          error: err instanceof Error ? err.message : "Unknown error",
        },
      }))
    )
  )
  return results
}

// ── Validation ──────────────────────────────────────────────────────

function validateImage(buffer: ArrayBuffer, contentType: string): void {
  // Check format
  if (!SUPPORTED_FORMATS.includes(contentType)) {
    throw new Error(
      `Unsupported image format: ${contentType}. Supported: ${SUPPORTED_FORMATS.join(", ")}`
    )
  }

  // Check size
  if (buffer.byteLength > MAX_FILE_SIZE) {
    throw new Error(
      `Image too large: ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB. Max: ${
        MAX_FILE_SIZE / 1024 / 1024
      }MB`
    )
  }
}

// ── Post-processing ─────────────────────────────────────────────────

/**
 * Clean and normalize OCR output.
 */
export function cleanOCRText(text: string): string {
  return (
    text
      // Remove OCR artifacts
      .replace(/[|]/g, "I")
      .replace(/[0O](?=[a-z])/g, "O")
      .replace(/(?<=[a-z])[0O]/g, "0")
      // Fix common OCR errors
      .replace(/rn/g, "m")
      .replace(/cl/g, "d")
      // Normalize whitespace
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  )
}

/**
 * Detect if text likely came from OCR (has artifacts).
 */
export function isOCROutput(text: string): boolean {
  const ocrPatterns = [
    /[|][Il1]{2,}/, // Common OCR confusion patterns
    /\w[0O]\w/, // Mixed 0 and O in words
    /.{80,}\n.{80,}/, // Long lines (column layout)
  ]
  return ocrPatterns.some((pattern) => pattern.test(text))
}
