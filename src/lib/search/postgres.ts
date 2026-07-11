/**
 * Postgres Full-Text Search
 * Provides: Full-text search using PostgreSQL's built-in tsvector/tsquery.
 * Used by: Search API routes, hybrid search pipeline.
 *
 * Features:
 * - tsvector generation with weighted columns (title A, content B, tags C)
 * - Websearch-to-tsquery parsing (phrases, AND, OR, NOT)
 * - Highlighting with ts_headline
 * - Ranking with ts_rank_cd (cover density)
 * - Fuzzy matching with similarity (pg_trm)
 */

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// ── Types ───────────────────────────────────────────────────────────

export interface SearchResult {
  id: string
  title: string
  content: string
  highlight: string
  rank: number
  source: string
  url: string
  created_at: string
}

export interface SearchOptions {
  limit?: number
  offset?: number
  filters?: Record<string, string>
  fuzzy?: boolean
  highlight?: boolean
}

// ── Constants ───────────────────────────────────────────────────────

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

// Weight configuration for ranking: D < C < B < A
const TS_WEIGHTS = 'A:1.0, B:0.4, C:0.2, D:0.1'

// ── Search ──────────────────────────────────────────────────────────

/**
 * Full-text search using PostgreSQL tsvector.
 * Parses query with websearch_to_tsquery for phrase/operator support.
 */
export async function searchPostgres(
  query: string,
  options: SearchOptions = {}
): Promise<{ results: SearchResult[]; total: number }> {
  const {
    limit = DEFAULT_LIMIT,
    offset = 0,
    fuzzy = false,
    highlight = true,
  } = options

  const clampedLimit = Math.min(limit, MAX_LIMIT)
  const supabase = createClient()

  // Use the stored procedure for hybrid search
  const { data, error } = await supabase.rpc('hybrid_search', {
    query_text: query,
    query_embedding: null, // FTS-only search
    match_count: clampedLimit,
    full_text_weight: 1.0,
    semantic_weight: 0.0,
    rrff_k: 60,
    include_highlights: highlight,
  })

  if (error) {
    console.error('Postgres search error:', error)
    throw new Error(`Search failed: ${error.message}`)
  }

  if (!data) {
    return { results: [], total: 0 }
  }

  const results: SearchResult[] = data.map((row: any) => ({
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    highlight: row.highlight || '',
    rank: row.rank || 0,
    source: row.source || 'unknown',
    url: row.url || '',
    created_at: row.created_at,
  }))

  // Get total count (approximate from first result's full_count if available)
  const total = results[0]?.full_count ? parseInt(results[0].full_count) : results.length

  return { results, total }
}

/**
 * Fuzzy search using pg_trgm similarity.
 * Best for: typos, approximate matching, autocomplete.
 */
export async function fuzzySearch(
  query: string,
  options: SearchOptions = {}
): Promise<{ results: SearchResult[]; total: number }> {
  const { limit = DEFAULT_LIMIT, offset = 0 } = options
  const clampedLimit = Math.min(limit, MAX_LIMIT)
  const supabase = createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*, similarity(title, query) as sim_rank', { count: 'exact' })
    .ilike('title', `%${query}%`)
    .order('sim_rank', { ascending: false })
    .limit(clampedLimit)
    .offset(offset)

  if (error) {
    console.error('Fuzzy search error:', error)
    throw new Error(`Fuzzy search failed: ${error.message}`)
  }

  const results: SearchResult[] = (data || []).map((row: any) => ({
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    highlight: '',
    rank: row.sim_rank || 0,
    source: row.source || 'unknown',
    url: row.url || '',
    created_at: row.created_at,
  }))

  return { results, total: results.length }
}

/**
 * Autocomplete suggestions using prefix matching.
 */
export async function getAutocompleteSuggestions(
  prefix: string,
  limit: number = 10
): Promise<string[]> {
  if (!prefix || prefix.length < 2) return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('title')
    .ilike('title', `${prefix}%`)
    .limit(limit)

  if (error) {
    console.error('Autocomplete error:', error)
    return []
  }

  return (data || []).map((row: any) => row.title).filter(Boolean)
}

/**
 * Get search facets (categories/sources) for filtering.
 */
export async function getSearchFacets(): Promise<{
  sources: string[]
  categories: string[]
}> {
  const supabase = createClient()

  const [sourcesResult, categoriesResult] = await Promise.all([
    supabase.from('documents').select('source', { count: 'exact', head: true }),
    supabase.from('documents').select('category', { count: 'exact', head: true }),
  ])

  return {
    sources: [], // Would need aggregation query
    categories: [],
  }
}

// ── Helper: Build Highlight Config ─────────────────────────────────

function buildHighlightConfig(): string {
  return `StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=10, ShortWord=3, HighlightAll=false, MaxFragments=3, FragmentDelimiter=" ... "`
}

// ── Helper: Parse Query ─────────────────────────────────────────────

/**
 * Sanitize and prepare a search query for tsquery.
 * Handles: phrases ("..."), operators (AND, OR, NOT), wildcards.
 */
export function sanitizeQuery(query: string): string {
  // Remove special characters that could break tsquery
  return query
    .replace(/[^\w\s\-"'&|!]/g, ' ')
    .trim()
    .substring(0, 200) // Limit query length
}
