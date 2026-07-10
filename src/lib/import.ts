// src/lib/import.ts
// File import handling for PDFs, text files, and HTML

import { parseCaseText, parseCasePDF } from './parse';
import { prisma } from './db';
import { serialize } from './serialize';

export interface ImportResult {
  success: boolean;
  caseId?: string;
  title?: string;
  error?: string;
}

export async function importTextFile(content: string, filename: string): Promise<ImportResult> {
  try {
    const parsed = parseCaseText(content);
    
    const case_ = await prisma.case.create({
      data: {
        title: parsed.title || filename,
        content: parsed.content,
        date: parsed.date,
        court: parsed.court,
        judges: parsed.judges,
        parties: parsed.parties,
        summary: parsed.summary,
        sourceName: 'import',
        year: parsed.year,
        paragraphs: {
          create: parsed.paragraphs?.map((p, i) => ({
            number: i + 1,
            text: p,
          })) || [],
        },
      },
    });
    
    return { success: true, caseId: case_.id, title: case_.title };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function importPDFFile(pdfText: string, filename: string): Promise<ImportResult> {
  try {
    const parsed = parseCasePDF(pdfText);
    
    const case_ = await prisma.case.create({
      data: {
        title: parsed.title || filename,
        content: parsed.content,
        pdfText: pdfText,
        date: parsed.date,
        court: parsed.court,
        judges: parsed.judges,
        parties: parsed.parties,
        summary: parsed.summary,
        sourceName: 'pdf-import',
        year: parsed.year,
        paragraphs: {
          create: parsed.paragraphs?.map((p, i) => ({
            number: i + 1,
            text: p,
          })) || [],
        },
      },
    });
    
    return { success: true, caseId: case_.id, title: case_.title };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function importFromURL(url: string): Promise<ImportResult> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('pdf')) {
      // Handle PDF
      const arrayBuffer = await response.arrayBuffer();
      // Would need PDF parsing library here
      return { success: false, error: 'PDF URL import not yet implemented' };
    } else {
      const text = await response.text();
      return importTextFile(text, url);
    }
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
