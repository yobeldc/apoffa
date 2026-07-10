import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serialize } from "@/lib/serialize";

export async function GET() {
  try {
    const saved = await prisma.savedCase.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(serialize(saved));
  } catch (error) {
    console.error("Saved cases fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved cases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { caseId, notes, tags } = await request.json();

    const saved = await prisma.savedCase.upsert({
      where: { caseId },
      create: {
        caseId,
        notes,
        tags: tags ? JSON.stringify(tags) : null,
      },
      update: {
        notes,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    return NextResponse.json(serialize(saved), { status: 201 });
  } catch (error) {
    console.error("Save case error:", error);
    return NextResponse.json(
      { error: "Failed to save case" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("id");

    if (!caseId) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    await prisma.savedCase.delete({
      where: { caseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsave case error:", error);
    return NextResponse.json(
      { error: "Failed to unsave case" },
      { status: 500 }
    );
  }
}
