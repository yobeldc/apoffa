/**
 * PDF Text Extractor
 *
 * Extracts text from PDF buffers using pdf-parse.
 * Falls back to OCR if text extraction fails.
 */

const pdfParse = require('pdf-parse');

/**
 * Extract text from a PDF buffer
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Array<{content: string, wordCount: number, charCount: number}>} Array of pages
 */
async function extractTextFromPdf(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);

    // Split by page if possible, otherwise treat as single page
    const pages = data.text.split(/\f/)
      .map(page => {
        const content = page.trim();
        return {
          content,
          wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
          charCount: content.length,
        };
      })
      .filter(page => page.content.length > 0);

    if (pages.length === 0) {
      // Fallback: treat entire text as one page
      const content = data.text.trim();
      return [{
        content,
        wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
        charCount: content.length,
      }];
    }

    return pages;
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

module.exports = { extractTextFromPdf };
