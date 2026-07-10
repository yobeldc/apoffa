// src/lib/document-extraction/extractor.ts
// Main document extraction orchestrator

import { extractTextFromPDF } from './pdf-text';
import { extractTextFromHTML } from './html-text';
import { extractTextFromPlainText } from './plain-text';
import { performOCR } from './ocr';
import { ExtractedDocument, ExtractionOptions } from './types';

export async function extractDocument(
  content: Buffer | string,
  mimeType: string,
  options: ExtractionOptions = {}
): Promise<ExtractedDocument> {
  const startTime = Date.now();

  let text: string;
  let ocrText: string | undefined;

  switch (mimeType) {
    case 'application/pdf':
      text = await extractTextFromPDF(content as Buffer);
      
      // If PDF extraction yields little text, try OCR
      if (text.trim().length < 100 && options.useOCR !== false) {
        ocrText = await performOCR(content as Buffer);
        text = ocrText || text;
      }
      break;

    case 'text/html':
    case 'text/html; charset=utf-8':
      text = extractTextFromHTML(content as string);
      break;

    case 'text/plain':
    case 'text/plain; charset=utf-8':
      text = extractTextFromPlainText(content as string);
      break;

    default:
      // Try to handle as plain text for unknown types
      text = extractTextFromPlainText(content.toString());
  }

  const endTime = Date.now();

  return {
    text,
    ocrText,
    mimeType,
    metadata: {
      extractionMethod: mimeType === 'application/pdf' && ocrText ? 'ocr' : 'native',
      extractionTimeMs: endTime - startTime,
      wordCount: text.split(/\s+/).filter((w) => w.length > 0).length,
      charCount: text.length,
    },
  };
}

export function detectMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'html':
    case 'htm':
      return 'text/html';
    case 'txt':
    case 'text':
      return 'text/plain';
    case 'doc':
    case 'docx':
      return 'application/msword';
    default:
      return 'application/octet-stream';
  }
}
