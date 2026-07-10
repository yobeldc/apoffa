// src/lib/rag/chunk.ts
// Document chunking strategies for RAG

export interface Chunk {
  id: string;
  text: string;
  metadata: {
    caseId: string;
    paragraphNumber?: number;
    startIndex: number;
    endIndex: number;
  };
}

export function chunkByParagraphs(
  caseId: string,
  text: string,
  maxChunkSize: number = 1000,
  overlap: number = 100
): Chunk[] {
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0);
  const chunks: Chunk[] = [];
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    
    // If paragraph is too long, split it further
    if (paragraph.length > maxChunkSize) {
      const subChunks = splitLongText(caseId, paragraph, i, maxChunkSize, overlap, chunkIndex);
      chunks.push(...subChunks);
      chunkIndex += subChunks.length;
    } else {
      chunks.push({
        id: `${caseId}-chunk-${chunkIndex}`,
        text: paragraph,
        metadata: {
          caseId,
          paragraphNumber: i + 1,
          startIndex: 0,
          endIndex: paragraph.length,
        },
      });
      chunkIndex++;
    }
  }

  return chunks;
}

export function chunkByFixedSize(
  caseId: string,
  text: string,
  maxChunkSize: number = 1000,
  overlap: number = 100
): Chunk[] {
  const chunks: Chunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + maxChunkSize, text.length);
    
    // Try to break at a sentence boundary
    const breakPoint = findSentenceBoundary(text, endIndex);
    const actualEnd = breakPoint > startIndex ? breakPoint : endIndex;

    chunks.push({
      id: `${caseId}-chunk-${chunkIndex}`,
      text: text.slice(startIndex, actualEnd).trim(),
      metadata: {
        caseId,
        startIndex,
        endIndex: actualEnd,
      },
    });

    startIndex = actualEnd - overlap;
    chunkIndex++;
  }

  return chunks;
}

function splitLongText(
  caseId: string,
  text: string,
  paragraphNumber: number,
  maxChunkSize: number,
  overlap: number,
  startIndex: number
): Chunk[] {
  const chunks: Chunk[] = [];
  let pos = 0;
  let chunkNum = startIndex;

  while (pos < text.length) {
    const end = Math.min(pos + maxChunkSize, text.length);
    const breakPoint = findSentenceBoundary(text, end);
    const actualEnd = breakPoint > pos ? breakPoint : end;

    chunks.push({
      id: `${caseId}-chunk-${chunkNum}`,
      text: text.slice(pos, actualEnd).trim(),
      metadata: {
        caseId,
        paragraphNumber: paragraphNumber + 1,
        startIndex: pos,
        endIndex: actualEnd,
      },
    });

    pos = actualEnd - overlap;
    chunkNum++;
  }

  return chunks;
}

function findSentenceBoundary(text: string, aroundIndex: number): number {
  // Look for sentence-ending punctuation followed by space or newline
  const searchRange = 100; // Search within 100 chars of the target
  const start = Math.max(0, aroundIndex - searchRange);
  const end = Math.min(text.length, aroundIndex + searchRange);
  const searchText = text.slice(start, end);

  // Find the last sentence boundary before aroundIndex
  const sentenceEndRegex = /[.!?]\s+/g;
  let lastMatch = -1;
  let match;

  while ((match = sentenceEndRegex.exec(searchText)) !== null) {
    const absolutePos = start + match.index + 2; // +2 to include the punctuation and space
    if (absolutePos <= aroundIndex) {
      lastMatch = absolutePos;
    }
  }

  return lastMatch;
}
