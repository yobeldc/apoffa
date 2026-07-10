"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface CaseBreakdown {
  facts: string[];
  issues: string[];
  holdings: string[];
  reasoning: string[];
  dissent: string[];
  significance: string;
}

interface CaseBreakdownPanelProps {
  caseId: string;
}

export function CaseBreakdownPanel({ caseId }: CaseBreakdownPanelProps) {
  const [breakdown, setBreakdown] = useState<CaseBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBreakdown() {
      try {
        const response = await fetch(`/api/cases/${caseId}/breakdown`);
        if (response.ok) {
          const data = await response.json();
          setBreakdown(data);
        }
      } catch (error) {
        console.error("Failed to fetch breakdown:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBreakdown();
  }, [caseId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Case Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No breakdown available. Generate one with AI.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Case Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="facts">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="facts">Facts</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
            <TabsTrigger value="significance">Significance</TabsTrigger>
          </TabsList>

          <TabsContent value="facts" className="mt-4">
            <ul className="list-inside list-disc space-y-1 text-sm">
              {breakdown.facts.map((fact, i) => (
                <li key={i}>{fact}</li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="issues" className="mt-4">
            <ul className="list-inside list-decimal space-y-1 text-sm">
              {breakdown.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="holdings" className="mt-4">
            <ul className="list-inside list-disc space-y-1 text-sm">
              {breakdown.holdings.map((holding, i) => (
                <li key={i}>{holding}</li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="reasoning" className="mt-4">
            <ul className="list-inside list-disc space-y-1 text-sm">
              {breakdown.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="significance" className="mt-4">
            <p className="text-sm">{breakdown.significance}</p>
            {breakdown.dissent.length > 0 && (
              <div className="mt-4">
                <Badge variant="outline">Dissent</Badge>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                  {breakdown.dissent.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
