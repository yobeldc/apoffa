import { NextRequest, NextResponse } from "next/server";
import { stopIngestionJob } from "@/lib/ingest";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await stopIngestionJob(params.id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Job stop error:", error);
    return NextResponse.json(
      { error: "Failed to stop job" },
      { status: 500 }
    );
  }
}
