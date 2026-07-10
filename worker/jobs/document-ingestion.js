/**
 * Document Ingestion Job Handler
 *
 * Processes document ingestion jobs:
 *   1. Download PDF from URL or storage
 *   2. Extract text using PDF parser or OCR
 *   3. Split into pages
 *   4. Create chunks along legal section boundaries
 *   5. Store in document_pages and document_chunks tables
 */

const { extractTextFromPdf } = require('../lib/pdf-extractor');
const { chunkDocument } = require('../lib/chunker');

/**
 * Handle a document ingestion job
 * @param {Object} payload - Job payload
 * @param {Object} context - { pool, supabase }
 */
async function handleDocumentIngestion(payload, context) {
  const { pool, supabase } = context;
  const { url, source_type = 'pdf', case_id } = payload;

  console.log(`[Ingestion] Processing: ${url}`);

  // 1. Download/fetch the document
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${url} (${response.status})`);
  }
  const pdfBuffer = Buffer.from(await response.arrayBuffer());

  // 2. Extract text
  const pages = await extractTextFromPdf(pdfBuffer);
  console.log(`[Ingestion] Extracted ${pages.length} pages`);

  // 3. Store pages and create chunks
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];

      // Insert page
      const pageResult = await client.query(`
        INSERT INTO document_pages (source_url, source_type, page_number, content, word_count, char_count)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [url, source_type, i + 1, page.content, page.wordCount, page.charCount]);

      const pageId = pageResult.rows[0].id;

      // Create chunks for this page
      const chunks = chunkDocument(page.content);
      for (let j = 0; j < chunks.length; j++) {
        await client.query(`
          INSERT INTO document_chunks (page_id, source_url, chunk_index, content, section_type, word_count, char_count)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [pageId, url, j, chunks[j].content, chunks[j].sectionType, chunks[j].wordCount, chunks[j].charCount]);
      }
    }

    // Update case decision with extracted text if case_id provided
    if (case_id) {
      const fullText = pages.map(p => p.content).join('\n\n');
      await client.query(`
        UPDATE case_decisions SET full_text = $1, updated_at = now() WHERE id = $2
      `, [fullText, case_id]);
    }

    await client.query('COMMIT');
    console.log(`[Ingestion] Completed: ${url} (${pages.length} pages)`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { handleDocumentIngestion };
