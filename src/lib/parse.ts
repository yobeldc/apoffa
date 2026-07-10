// src/lib/parse.ts
// Text parsing utilities for legal case extraction

export interface ParsedCase {
  title?: string;
  content: string;
  date?: Date;
  court?: string;
  judges?: string;
  parties?: string;
  summary?: string;
  year?: number;
  paragraphs?: string[];
}

export function parseCaseText(text: string): ParsedCase {
  const lines = text.split('\n').filter((l) => l.trim());
  
  // Try to extract title from first line
  const title = lines[0]?.trim();
  
  // Try to extract court, date, parties from headers
  const court = extractField(text, 'Court:', 'Tribunal:');
  const dateStr = extractField(text, 'Date:', 'Decided:');
  const judges = extractField(text, 'Judges:', 'Judge:', 'Panel:');
  const parties = extractField(text, 'Parties:', 'Between:', 'Plaintiff:');
  
  // Extract year from date or title
  const year = extractYear(dateStr || title || '');
  
  // Split into paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);
  
  // Generate summary from first substantial paragraph
  const summary = paragraphs.find((p) => p.length > 50 && p.length < 500);
  
  return {
    title,
    content: text,
    date: dateStr ? parseDate(dateStr) : undefined,
    court,
    judges,
    parties,
    summary,
    year,
    paragraphs,
  };
}

export function parseCasePDF(pdfText: string): ParsedCase {
  // PDF text often has different formatting
  // Apply similar parsing but handle PDF-specific quirks
  return parseCaseText(pdfText);
}

function extractField(text: string, ...labels: string[]): string | undefined {
  for (const label of labels) {
    const regex = new RegExp(`${label}\\s*(.+?)(?:\\n|$)`, 'i');
    const match = text.match(regex);
    if (match) return match[1].trim();
  }
  return undefined;
}

function extractYear(text: string): number | undefined {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0]) : undefined;
}

function parseDate(dateStr: string): Date | undefined {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
}
