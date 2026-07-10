/**
 * Embedding Generation Job Handler
 *
 * Generates vector embeddings for document chunks:
 *   1. Fetch unembedded chunks from document_chunks
 *   2. Call embedding API (Ollama, OpenAI, etc.)
 *   3. Store vectors in chunk_embeddings
 */

/**
 * Handle an embedding generation job
 * @param {Object} payload - Job payload
 * @param {Object} context - { pool, supabase }
 */
async function handleEmbeddingGeneration(payload, context) {
  const { pool } = context;
  const { batch_size = 10 } = payload;

  const client = await pool.connect();
  try {
    // Find chunks without embeddings
    const { rows: chunks } = await client.query(`
      SELECT dc.id, dc.content
      FROM document_chunks dc
      LEFT JOIN chunk_embeddings ce ON dc.id = ce.chunk_id
      WHERE ce.id IS NULL
      LIMIT $1
    `, [batch_size]);

    if (chunks.length === 0) {
      console.log('[Embedding] No chunks to process');
      return;
    }

    console.log(`[Embedding] Processing ${chunks.length} chunks`);

    // Generate embeddings via API
    const embeddings = await generateEmbeddings(chunks.map(c => c.content));

    // Store embeddings
    for (let i = 0; i < chunks.length; i++) {
      const embedding = embeddings[i];
      const embeddingJson = JSON.stringify(embedding);

      await client.query(`
        INSERT INTO chunk_embeddings (chunk_id, embedding, embedding_json, model)
        VALUES ($1, $2::vector, $3, $4)
      `, [chunks[i].id, embeddingJson, embeddingJson, process.env.RAG_EMBEDDING_MODEL || 'bge-m3']);
    }

    console.log(`[Embedding] Completed ${chunks.length} chunks`);
  } finally {
    client.release();
  }
}

/**
 * Generate embeddings via Ollama or other provider
 */
async function generateEmbeddings(texts) {
  const provider = process.env.RAG_EMBEDDING_PROVIDER || 'ollama';
  const model = process.env.RAG_EMBEDDING_MODEL || 'bge-m3';
  const baseUrl = process.env.RAG_EMBEDDING_BASE_URL || 'http://localhost:11434';

  if (provider === 'ollama') {
    const embeddings = [];
    for (const text of texts) {
      const response = await fetch(`${baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: text }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      embeddings.push(data.embedding);
    }
    return embeddings;
  }

  throw new Error(`Unsupported embedding provider: ${provider}`);
}

module.exports = { handleEmbeddingGeneration };
