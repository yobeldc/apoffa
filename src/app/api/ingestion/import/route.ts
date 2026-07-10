import { NextRequest, NextResponse } from "next/server";
import { importTextFile, importPDFFile } from "@/lib/import";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      let result;
      if (file.type === "application/pdf") {
        result = await importPDFFile(buffer.toString("utf-8"), file.name);
      } else {
        result = await importTextFile(buffer.toString("utf-8"), file.name);
      }

      return NextResponse.json(result);
    }

    const body = await request.json();

    if (body.url) {
      const response = await fetch(body.url);
      const text = await response.text();
      const result = await importTextFile(text, body.url);
      return NextResponse.json(result);
    }

    if (body.text) {
      const result = await importTextFile(body.text, "pasted-text");
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "No content provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import" },
      { status: 500 }
    );
  }
}
