"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface FileImportPanelProps {
  onImport?: (result: { success: boolean; message: string }) => void;
}

export function FileImportPanel({ onImport }: FileImportPanelProps) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<Array<{ filename: string; status: string }>>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsLoading(true);
      const results: Array<{ filename: string; status: string }> = [];

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch("/api/ingestion/import", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            results.push({ filename: file.name, status: "success" });
          } else {
            results.push({ filename: file.name, status: "failed" });
          }
        } catch {
          results.push({ filename: file.name, status: "error" });
        }
      }

      setImportResults(results);
      setIsLoading(false);

      const allSuccess = results.every((r) => r.status === "success");
      onImport?.({
        success: allSuccess,
        message: `Imported ${results.filter((r) => r.status === "success").length} of ${results.length} files`,
      });
    },
    [onImport]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/html": [".html"],
    },
  });

  async function handleUrlImport() {
    if (!url.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/ingestion/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        setImportResults([{ filename: url, status: "success" }]);
        onImport?.({ success: true, message: "URL imported successfully" });
      } else {
        setImportResults([{ filename: url, status: "failed" }]);
        onImport?.({ success: false, message: "Failed to import URL" });
      }
    } catch {
      setImportResults([{ filename: url, status: "error" }]);
      onImport?.({ success: false, message: "Error importing URL" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTextImport() {
    if (!text.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/ingestion/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        setImportResults([{ filename: "pasted-text", status: "success" }]);
        onImport?.({ success: true, message: "Text imported successfully" });
      } else {
        setImportResults([{ filename: "pasted-text", status: "failed" }]);
        onImport?.({ success: false, message: "Failed to import text" });
      }
    } catch {
      setImportResults([{ filename: "pasted-text", status: "error" }]);
      onImport?.({ success: false, message: "Error importing text" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Cases</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-4">
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, TXT, HTML
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter URL to a legal document..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button onClick={handleUrlImport} disabled={isLoading}>
                {isLoading ? "Importing..." : "Import"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="text" className="mt-4 space-y-4">
            <textarea
              className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Paste case text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button onClick={handleTextImport} disabled={isLoading}>
              {isLoading ? "Importing..." : "Import Text"}
            </Button>
          </TabsContent>
        </Tabs>

        {importResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Import Results</h4>
            {importResults.map((result, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="truncate">{result.filename}</span>
                <Badge
                  variant={
                    result.status === "success"
                      ? "default"
                      : result.status === "failed"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {result.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
