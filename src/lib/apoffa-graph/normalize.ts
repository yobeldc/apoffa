/"use server"

/**
 * AP OFFA Graph Normalization Utilities
 * Handles: Normalizing Indonesian legal entity names and identifiers.
 */

/**
 * Normalize a court name to a standard format.
 */
export function normalizeCourtName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(PENGADILAN NEGERI|PN|Pengadilan Negeri)\s+/i, "PN ")
    .replace(/^(PENGADILAN TINGGI|PT|Pengadilan Tinggi)\s+/i, "PT ")
    .replace(/^(MAHKAMAH AGUNG|MA|Mahkamah Agung)\s+/i, "MA")
    .toUpperCase()
}

/**
 * Normalize case number format.
 */
export function normalizeCaseNumber(nomor: string): string {
  return nomor
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
}

/**
 * Normalize article reference format.
 */
export function normalizeArticleReference(article: string): string {
  return article
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^Pasal\s+/i, "")
    .replace(/^ayat\s+\((\d+)\)/i, "($1)")
}
