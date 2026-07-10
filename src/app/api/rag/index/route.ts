import { NextRequest, NextResponse } from "next/server";
import { indexCase, indexAllCases, getIndexStatus } from "@/lib/rag/index";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.caseId) {
      const result = await indexCase(body.caseId);
      return NextResponse.json(result);
    }

    if (body.reindexAll) {
      const results = await indexAllCases();
      return NextResponse.json({ results });
    }

    return NextResponse.json(
      { error: "No caseId or reindexAll provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Indexing error:", error);
    return NextResponse.json(
      { error: "Failed to index" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json(
        { error: "caseId is required" },
        { status: 400 }
      );
    }

    const status = await getIndexStatus(caseId);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Index status error:", error);
    return NextResponse.json(
      { error: "Failed to get index status" },
      { status: 500 }
    );
  }
}
