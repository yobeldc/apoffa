/import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/cases/:id/apoffa-graph/similar
 * Find cases similar to the given case using vector similarity.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  // Get the case embedding
  const { data: chunks, error } = await supabase
    .from("document_chunks")
    .select("embedding")
    .eq("document_id", params.id)
    .limit(1)

  if (error || !chunks?.[0]?.embedding) {
    return NextResponse.json(
      { error: "Case not found or not indexed" },
      { status: 404 }
    )
  }

  // Find similar chunks (excluding the same document)
  const { data: similar } = await supabase.rpc("match_document_chunks", {
    query_embedding: chunks[0].embedding,
    match_threshold: 0.7,
    match_count: 10,
  })

  return NextResponse.json({ similar: similar || [] })
}
