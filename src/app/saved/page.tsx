"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Bookmark, Trash2 } from "lucide-react";

interface SavedCase {
  id: string;
  caseId: string;
  notes: string | null;
  tags: string | null;
  createdAt: string;
}

export default function SavedPage() {
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSaved() {
      try {
        const response = await fetch("/api/saved");
        if (response.ok) {
          const data = await response.json();
          setSavedCases(data);
        }
      } catch (error) {
        console.error("Failed to fetch saved cases:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSaved();
  }, []);

  async function handleUnsave(caseId: string) {
    try {
      await fetch(`/api/saved?id=${caseId}`, { method: "DELETE" });
      setSavedCases((prev) => prev.filter((s) => s.caseId !== caseId));
    } catch (error) {
      console.error("Failed to unsave:", error);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Saved Cases</h1>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : savedCases.length === 0 ? (
        <EmptyState
          title="No saved cases"
          description="Save cases you're interested in for quick access."
          icon={<Bookmark className="h-8 w-8" />}
          action={{
            label: "Browse Cases",
            onClick: () => router.push("/search"),
          }}
        />
      ) : (
        <div className="grid gap-4">
          {savedCases.map((saved) => (
            <Card key={saved.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => router.push(`/cases/${saved.caseId}`)}
                >
                  <p className="font-medium">Case ID: {saved.caseId}</p>
                  {saved.notes && (
                    <p className="text-sm text-muted-foreground">
                      {saved.notes}
                    </p>
                  )}
                  {saved.tags && (
                    <Badge variant="outline" className="mt-1">
                      {saved.tags}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUnsave(saved.caseId)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
