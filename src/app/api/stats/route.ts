/import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/stats
 * Returns aggregate statistics for the dashboard.
 */
export async function GET() {
  const supabase = createClient()

  const [documentsResult, chunksResult] = await Promise.all([
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("document_chunks").select("*", { count: "exact", head: true }),
  ])

  return NextResponse.json({
    documents: documentsResult.count || 0,
    chunks: chunksResult.count || 0,
    timestamp: new Date().toISOString(),
  })
}
