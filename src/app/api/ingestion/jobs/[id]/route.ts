/import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * GET /api/ingestion/jobs/:id
 * Get a specific ingestion job by ID.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("ingestion_jobs")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
