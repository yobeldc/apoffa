import { NextRequest, NextResponse } from "next/server";
import { searchCasesAdvanced } from "@/lib/search";
import { prisma } from "@/lib/db";
import { serialize } from "@/lib/serialize";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const year = searchParams.get("year");
    const court = searchParams.get("court");
    const caseType = searchParams.get("caseType");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    if (!q.trim()) {
      const cases = await prisma.case.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({
        cases: serialize(cases),
        total: await prisma.case.count(),
        page,
        pageSize,
      });
    }

    const result = await searchCasesAdvanced({
      query: q,
      filters: {
        ...(year ? { year: parseInt(year) } : {}),
        ...(court ? { court } : {}),
        ...(caseType ? { caseType } : {}),
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}
