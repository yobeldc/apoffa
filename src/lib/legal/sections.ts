// src/lib/legal/sections.ts
// Legal section and paragraph identification

export interface LegalSection {
  type: 'heading' | 'paragraph' | 'blockquote' | 'list' | 'footnote';
  number?: number;
  text: string;
  level?: number;
}

export function identifySections(text: string): LegalSection[] {
  const sections: LegalSection[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.length === 0) continue;
    
    // Check for headings (numbered or uppercase)
    if (isHeading(trimmed)) {
      sections.push({
        type: 'heading',
        text: trimmed,
        level: getHeadingLevel(trimmed),
      });
      continue;
    }
    
    // Check for blockquotes (indented text)
    if (line.startsWith('    ') || line.startsWith('\t')) {
      sections.push({
        type: 'blockquote',
        text: trimmed,
      });
      continue;
    }
    
    // Check for list items
    if (isListItem(trimmed)) {
      sections.push({
        type: 'list',
        text: trimmed,
        number: extractListNumber(trimmed),
      });
      continue;
    }
    
    // Check for footnotes
    if (isFootnote(trimmed)) {
      sections.push({
        type: 'footnote',
        text: trimmed,
        number: extractFootnoteNumber(trimmed),
      });
      continue;
    }
    
    // Default to paragraph
    sections.push({
      type: 'paragraph',
      text: trimmed,
    });
  }
  
  return sections;
}

function isHeading(line: string): boolean {
  // All uppercase lines
  if (line === line.toUpperCase() && line.length > 10 && line.length < 100) {
    return true;
  }
  
  // Numbered sections (e.g., "1. Introduction", "II. Background")
  if (/^[\dIVX]+[.\)]\s+\w+/.test(line)) {
    return true;
  }
  
  // Underlined headings (lines followed by === or ---)
  // This would need lookahead, handled separately
  
  return false;
}

function getHeadingLevel(line: string): number {
  if (/^[\d]+[.\)]/.test(line)) return 1;
  if (/^[a-zA-Z][.\)]/.test(line)) return 2;
  if (/^[(]?\d+[)]?/.test(line)) return 3;
  return 1;
}

function isListItem(line: string): boolean {
  return /^[\d]+[.\)]\s/.test(line) || /^[-•*]\s/.test(line);
}

function extractListNumber(line: string): number | undefined {
  const match = line.match(/^(\d+)/);
  return match ? parseInt(match[1]) : undefined;
}

function isFootnote(line: string): boolean {
  return /^\[?\d+\]?\s/.test(line) && line.length < 200;
}

function extractFootnoteNumber(line: string): number | undefined {
  const match = line.match(/^\[(\d+)\]/);
  return match ? parseInt(match[1]) : undefined;
}

export function extractHeadings(text: string): Array<{ level: number; text: string }> {
  const sections = identifySections(text);
  return sections
    .filter((s): s is LegalSection & { type: 'heading' } => s.type === 'heading')
    .map((s) => ({ level: s.level || 1, text: s.text }));
}
