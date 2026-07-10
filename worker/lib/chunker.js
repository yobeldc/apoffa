//**
 * Document Chunker
 *
 * Splits document text into chunks along legal section boundaries.
 * Recognizes Indonesian legal section markers like:
 *   - Menimbang
 *   - Mengingat
 *   - Menetapkan
 *   - Mengadili
 */

const LEGAL_SECTIONS = [
  'Menimbang',
  'Mengingat',
  'Menetapkan',
  'Mengadili',
  'Bahwa',
  'Selanjutnya',
];

const SECTION_REGEX = new RegExp(
  `(?:^|\\n)\\s*((${LEGAL_SECTIONS.join('|')})[\\s:.,;]+)`,
  'gi'
);

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

/**
 * Chunk document content along legal section boundaries
 * @param {string} content - Document text
 * @param {Object} options - Chunking options
 * @returns {Array<{content: string, sectionType: string, wordCount: number, charCount: number}>}
 */
function chunkDocument(content, options = {}) {
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  const chunkOverlap = options.chunkOverlap || DEFAULT_CHUNK_OVERLAP;

  // Split by legal sections
  const sections = splitBySections(content);

  if (sections.length === 0) {
    // Fallback: simple word-based chunking
    return simpleChunk(content, chunkSize, chunkOverlap);
  }

  const chunks = [];
  for (const section of sections) {
    if (section.content.length <= chunkSize) {
      chunks.push(section);
    } else {
      // Split large sections further
      const subChunks = simpleChunk(section.content, chunkSize, chunkOverlap);
      for (const sub of subChunks) {
        chunks.push({
          ...sub,
          sectionType: section.sectionType,
        });
      }
    }
  }

  return chunks;
}

/**
 * Split content by legal section headers
 */
function splitBySections(content) {
  const sections = [];
  let lastIndex = 0;
  let currentSection = null;

  const regex = new RegExp(
    `(?:^|\\n)\\s*((${LEGAL_SECTIONS.join('|')})[\\s:.,;]+)`,
    'gi'
  );

  let match;
  while ((match = regex.exec(content)) !== null) {
    if (currentSection) {
      const sectionContent = content.substring(lastIndex, match.index).trim();
      if (sectionContent.length > 0) {
        sections.push(createSection(sectionContent, currentSection));
      }
    }
    currentSection = match[2];
    lastIndex = match.index;
  }

  // Add remaining content
  if (currentSection && lastIndex < content.length) {
    const sectionContent = content.substring(lastIndex).trim();
    if (sectionContent.length > 0) {
      sections.push(createSection(sectionContent, currentSection));
    }
  }

  // If no sections found, return empty to trigger fallback
  if (sections.length === 0 && content.trim().length > 0) {
    return [];
  }

  return sections;
}

/**
 * Create a section object
 */
function createSection(content, sectionType) {
  const cleanContent = content.replace(/^\s*[\w\s]+[:.;,]\s*/i, '').trim();
  return {
    content: cleanContent || content,
    sectionType: sectionType || 'general',
    wordCount: (cleanContent || content).split(/\s+/).filter(w => w.length > 0).length,
    charCount: (cleanContent || content).length,
  };
}

/**
 * Simple word-based chunking with overlap
 */
function simpleChunk(content, chunkSize, chunkOverlap) {
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const chunks = [];

  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    const chunkContent = chunkWords.join(' ');

    chunks.push({
      content: chunkContent,
      sectionType: 'general',
      wordCount: chunkWords.length,
      charCount: chunkContent.length,
    });

    i += chunkSize - chunkOverlap;
  }

  return chunks;
}

module.exports = { chunkDocument };
