// src/lib/document-extraction/types.ts
// Types for document extraction

export interface ExtractedDocument {
  text: string;
  ocrText?: string;
  mimeType: string;
  metadata: {
    extractionMethod: 'native' | 'ocr' | 'hybrid';
    extractionTimeMs: number;
    wordCount: number;
    charCount: number;
  };
}

export interface ExtractionOptions {
  useOCR?: boolean;
  ocrEngine?: 'tesseract' | 'google-vision' | 'azure';
  language?: string;
  preserveFormatting?: boolean;
}

export interface ExtractorConfig {
  maxFileSizeMB: number;
  supportedMimeTypes: string[];
  ocrEnabled: boolean;
  defaultOCREngine: string;
}
