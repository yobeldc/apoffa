import { NextRequest, NextResponse } from "next/server";
import { getBreakdown, generateBreakdown } from "@/lib/legal/breakdown";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;

    let breakdown = await getBreakdown(caseId);

    if (!breakdown) {
      breakdown = await generateBreakdown(caseId);
    }

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Breakdown error:", error);
    return NextResponse.json(
      { error: "Failed to get breakdown" },
      { status: 500 }
    );
  }
}
