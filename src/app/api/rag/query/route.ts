import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/rag/answer";

export async function POST(request: NextRequest) {
  try {
    const { question, caseId } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const answer = await answerQuestion(question);

    return NextResponse.json(answer);
  } catch (error) {
    console.error("RAG query error:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
