"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileImportPanel } from "./file-import-panel";

interface IngestionJob {
  id: string;
  name: string;
  description: string | null;
  status: string;
  source: string;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  createdAt: string;
}

export function IngestionView() {
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);

  async function fetchJobs() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ingestion/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      running: "default",
      completed: "default",
      failed: "destructive",
      stopped: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ingestion</h1>
        <Button onClick={() => setShowImport(!showImport)}>
          {showImport ? "Hide Import" : "New Import"}
        </Button>
      </div>

      {showImport && <FileImportPanel onImport={() => fetchJobs()} />}

      <Card>
        <CardHeader>
          <CardTitle>Ingestion Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No ingestion jobs yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{job.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getStatusBadge(job.status)}
                      <span>{job.source}</span>
                      <span>
                        {job.processedItems}/{job.totalItems} processed
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* View job details */}}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
