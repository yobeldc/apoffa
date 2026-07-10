import { NextRequest, NextResponse } from "next/server";
import {
  getIngestionJobs,
  createIngestionJob,
  startIngestionJob,
  completeIngestionJob,
  failIngestionJob,
} from "@/lib/ingest";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const jobs = await getIngestionJobs(status);

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Jobs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const job = await createIngestionJob({
      name: body.name,
      description: body.description,
      source: body.source,
      sourceUrl: body.sourceUrl,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
