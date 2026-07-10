// src/lib/legal/normalize.ts
// Legal text normalization utilities

export function normalizeCaseTitle(title: string): string {
  return title
    .trim()
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Ensure proper formatting of "v."
    .replace(/\bv\s*\.\s*\b/gi, 'v. ')
    // Remove extra punctuation
    .replace(/\s*,\s*/g, ', ');
}

export function normalizeCourtName(court: string): string {
  const courtLower = court.toLowerCase().trim();
  
  // Common court name mappings
  const courtMap: Record<string, string> = {
    'hc': 'High Court',
    'sc': 'Supreme Court',
    'fca': 'Federal Court of Australia',
    'fcc': 'Federal Circuit Court',
    'nswca': 'NSW Court of Appeal',
    'nswsc': 'NSW Supreme Court',
    'vicsc': 'Victorian Supreme Court',
    'qldsc': 'Queensland Supreme Court',
  };
  
  return courtMap[courtLower] || court;
}

export function normalizePartyNames(parties: string): string[] {
  return parties
    .split(/\s+v\.\s+/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function extractYearFromCitation(citation: string): number | undefined {
  // Match year patterns like (2023), [2023], 2023
  const matches = citation.match(/[(\[]?(\d{4})[)\]]?/);
  return matches ? parseInt(matches[1]) : undefined;
}

export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}
