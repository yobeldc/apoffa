// src/lib/document-extraction/pdf-text.ts
// PDF text extraction

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // This is a placeholder implementation
  // In production, use pdf-parse or pdf-lib

  console.log('PDF extraction requested for buffer of size:', pdfBuffer.length);

  // Placeholder: return a message indicating the need for a PDF parser
  // Recommended libraries:
  // - pdf-parse (npm install pdf-parse)
  // - pdfjs-dist (Mozilla's PDF.js)
  // - pdf-lib (for more advanced PDF manipulation)

  return `[PDF extraction requires pdf-parse library. Install with: npm install pdf-parse]`;
}

export async function extractTextFromPDFWithPdfParse(
  pdfBuffer: Buffer
): Promise<string> {
  // Example with pdf-parse
  // const pdfParse = require('pdf-parse');
  // const data = await pdfParse(pdfBuffer);
  // return data.text;

  throw new Error('pdf-parse not installed. Run: npm install pdf-parse');
}

export function isScannedPDF(pdfBuffer: Buffer): boolean {
  // Heuristic: if PDF contains mostly images, it's likely scanned
  // A simple check is to see if the raw buffer has very little text
  const header = pdfBuffer.slice(0, 100).toString('ascii');
  return header.startsWith('%PDF');
}
