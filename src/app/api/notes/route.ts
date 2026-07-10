import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serialize } from "@/lib/serialize";

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(serialize(notes));
  } catch (error) {
    console.error("Notes fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, tags } = await request.json();

    const note = await prisma.note.create({
      data: {
        title,
        content,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    return NextResponse.json(serialize(note), { status: 201 });
  } catch (error) {
    console.error("Note creation error:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
