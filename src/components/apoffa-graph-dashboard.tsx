"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface DashboardData {
  totalCases: number;
  extractedCases: number;
  totalJudges: number;
  totalLegalIssues: number;
  totalStatutes: number;
  totalArticles: number;
  totalSentences: number;
  totalCitations: number;
  pendingReviews: number;
  issueDistribution: Array<{ label: string; count: number }>;
  outcomeDistribution: Array<{ outcome: string; count: number }>;
  extractionStatusDistribution: Array<{ status: string; count: number }>;
}

export function ApoffaGraphDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/apoffa-graph/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading dashboard...</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Failed to load dashboard.</p>;

  const stats = [
    { label: "Total Cases", value: data.totalCases },
    { label: "Extracted", value: data.extractedCases },
    { label: "Judges", value: data.totalJudges },
    { label: "Legal Issues", value: data.totalLegalIssues },
    { label: "Statutes", value: data.totalStatutes },
    { label: "Articles", value: data.totalArticles },
    { label: "Sentences", value: data.totalSentences },
    { label: "Citations", value: data.totalCitations },
    { label: "Pending Reviews", value: data.pendingReviews },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.issueDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Legal Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {data.issueDistribution.map((i) => (
                <div key={i.label} className="flex justify-between text-sm">
                  <span>{i.label}</span>
                  <span className="font-medium">{i.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
