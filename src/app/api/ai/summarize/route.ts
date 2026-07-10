import { NextRequest, NextResponse } from "next/server";
import { summarizeCase } from "@/lib/summarize";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const summary = await summarizeCase(text);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      { error: "Failed to summarize" },
      { status: 500 }
    );
  }
}
