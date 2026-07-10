import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const case_ = await prisma.case.findUnique({
      where: { id: params.id },
      select: { pdfUrl: true, pdfText: true },
    });

    if (!case_) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      pdfUrl: case_.pdfUrl,
      pdfText: case_.pdfText,
    });
  } catch (error) {
    console.error("PDF fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch PDF" },
      { status: 500 }
    );
  }
}
