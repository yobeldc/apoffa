import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Chunk {
  id: string;
  file_path: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
}

interface IngestBatch {
  chunks: Chunk[];
}

async function ingest() {
  const filePath = resolve(process.cwd(), process.argv[2] || 'chunks.json');
  console.log(`Reading chunks from ${filePath}...`);
  
  const raw = readFileSync(filePath, 'utf-8');
  const batch: IngestBatch = JSON.parse(raw);
  
  console.log(`Found ${batch.chunks.length} chunks to ingest`);

  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < batch.chunks.length; i += batchSize) {
    const slice = batch.chunks.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('document_chunks')
      .upsert(slice.map(chunk => ({
        id: chunk.id,
        file_path: chunk.file_path,
        content: chunk.content,
        embedding: chunk.embedding,
        metadata: chunk.metadata,
        updated_at: new Date().toISOString()
      })), { onConflict: 'id' });

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }
    
    console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(batch.chunks.length / batchSize)}`);
  }

  console.log('Ingest complete!');
}

ingest().catch(console.error);
