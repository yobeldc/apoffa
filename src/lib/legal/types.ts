// src/lib/legal/types.ts
// Types for legal processing

export interface LegalCase {
  id: string;
  title: string;
  date?: Date;
  court?: string;
  judges?: string;
  parties?: string;
  summary?: string;
  content: string;
  year?: number;
  caseType?: string;
}

export interface CaseCitation {
  id: string;
  caseId: string;
  citedCase: string;
  citedCaseId?: string;
  context?: string;
  paragraph?: number;
}

export interface Paragraph {
  id: string;
  caseId: string;
  number: number;
  text: string;
  classification?: ParagraphClassification;
}

export type ParagraphClassification =
  | 'facts'
  | 'issues'
  | 'holding'
  | 'reasoning'
  | 'dissent'
  | 'procedure'
  | 'other';

export interface IngestionConfig {
  source: 'pdf' | 'url' | 'text';
  sourceUrl?: string;
  extractMetadata: boolean;
  generateBreakdown: boolean;
  indexForSearch: boolean;
}

export interface SearchResult {
  caseId: string;
  title: string;
  court?: string;
  year?: number;
  relevance: number;
  snippet?: string;
}
