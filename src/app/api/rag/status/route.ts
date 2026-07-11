/import { NextResponse } from "next/server"

/**
 * GET /api/rag/status
 * Returns the current status of the RAG pipeline.
 */
export async function GET() {
  return NextResponse.json({
    status: "operational",
    timestamp: new Date().toISOString(),
  })
}
