/"use server"

/**
 * HTML Extractor
 * Extracts clean text content from HTML documents.
 * Uses: Cheerio-like DOM parsing for server environments.
 */

// ── Types ───────────────────────────────────────────────────────────

export interface HTMLExtractionOptions {
  includeImages: boolean
  includeLinks: boolean
  includeTables: boolean
  removeScripts: boolean
  removeStyles: boolean
  removeNav: boolean
  removeFooter: boolean
  removeAside: boolean
  removeHeader: boolean
  maxLength: number
}

export const DEFAULT_HTML_OPTIONS: HTMLExtractionOptions = {
  includeImages: false,
  includeLinks: false,
  includeTables: true,
  removeScripts: true,
  removeStyles: true,
  removeNav: true,
  removeFooter: true,
  removeAside: true,
  removeHeader: true,
  maxLength: 100000,
}

export interface HTMLExtractionResult {
  title: string
  content: string
  metadata: {
    url?: string
    author?: string
    date?: string
    description?: string
    keywords?: string[]
  }
}

// ── Extraction ──────────────────────────────────────────────────────

/**
 * Extract text from HTML string.
 * Server-safe: uses regex-based parsing (no DOM dependency).
 */
export async function extractFromHTML(
  html: string,
  options: Partial<HTMLExtractionOptions> = {}
): Promise<HTMLExtractionResult> {
  const opts = { ...DEFAULT_HTML_OPTIONS, ...options }
  let text = html

  // Remove unwanted elements
  if (opts.removeScripts) {
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  }
  if (opts.removeStyles) {
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
  }
  if (opts.removeNav) {
    text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
  }
  if (opts.removeFooter) {
    text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
  }
  if (opts.removeAside) {
    text = text.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
  }
  if (opts.removeHeader) {
    text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
  }

  // Extract title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
  const title = titleMatch?.[1]?.trim() || ""

  // Extract meta tags
  const metaTags: Record<string, string> = {}
  const metaMatches = html.matchAll(
    /<meta[^>]+(?:name|property)=["']([^"']+)["'][^>]*content=["']([^"']*)["'][^>]*>/gi
  )
  for (const match of metaMatches) {
    metaTags[match[1].toLowerCase()] = match[2]
  }

  // Extract description
  const description =
    metaTags["description"] ||
    metaTags["og:description"] ||
    ""

  // Extract author
  const author = metaTags["author"] || metaTags["article:author"] || ""

  // Extract date
  const date =
    metaTags["article:published_time"] ||
    metaTags["published-date"] ||
    ""

  // Extract keywords
  const keywords = metaTags["keywords"]
    ? metaTags["keywords"].split(",").map((k) => k.trim())
    : []

  // Extract main content (prefer article/main tags)
  let content = text
  const mainMatch = text.match(/<(?:main|article)[^>]*>([\s\S]*?)<\/(?:main|article)>/i)
  if (mainMatch) {
    content = mainMatch[1]
  }

  // Convert remaining HTML to text
  content = htmlToText(content)

  // Truncate if needed
  if (content.length > opts.maxLength) {
    content = content.substring(0, opts.maxLength) + "..."
  }

  return {
    title,
    content,
    metadata: {
      author,
      date,
      description,
      keywords,
    },
  }
}

/**
 * Convert HTML to plain text.
 */
function htmlToText(html: string): string {
  return (
    html
      // Replace block elements with newlines
      .replace(/<\/(?:p|div|section|article|h[1-6]|li|td|tr|br)\s*>/gi, "\n")
      // Replace table row endings
      .replace(/<\/tr\s*>/gi, "\n")
      // Remove all remaining tags
      .replace(/<[^>]+>/g, "")
      // Decode common HTML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      // Normalize whitespace
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  )
}
