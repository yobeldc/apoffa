"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/stat-tile";
import { CaseResultCard } from "@/components/case-result-card";
import { YearDistributionChart } from "@/components/year-distribution-chart";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, BookOpen } from "lucide-react";

interface DashboardStats {
  totalCases: number;
  totalIndexed: number;
  totalSaved: number;
  recentCases: Array<{
    id: string;
    title: string;
    year: number | null;
    court: string | null;
    createdAt: string;
  }>;
  yearDistribution: Array<{
    year: number | null;
    _count: { id: number };
  }>;
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/search");
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalCases: data.total || 0,
            totalIndexed: 0,
            totalSaved: 0,
            recentCases: data.cases?.slice(0, 5) || [],
            yearDistribution: [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  function handleSearch() {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to APOFF-AI Legal Research Platform
          </p>
        </div>
        <Button onClick={() => router.push("/ingestion")}>
          <Plus className="mr-2 h-4 w-4" />
          New Import
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search cases, courts, legal topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            title="Total Cases"
            value={stats?.totalCases || 0}
            description="Cases in database"
          />
          <StatTile
            title="Indexed"
            value={stats?.totalIndexed || 0}
            description="AI-searchable cases"
          />
          <StatTile
            title="Saved"
            value={stats?.totalSaved || 0}
            description="Bookmarked cases"
          />
          <StatTile
            title="This Week"
            value={stats?.recentCases.length || 0}
            description="New additions"
          />
        </div>
      )}

      {/* Recent Cases */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : stats?.recentCases && stats.recentCases.length > 0 ? (
              <div className="space-y-3">
                {stats.recentCases.map((c) => (
                  <div
                    key={c.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    onClick={() => router.push(`/cases/${c.id}`)}
                  >
                    <div>
                      <p className="font-medium">{c.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {c.court && <span>{c.court}</span>}
                        {c.year && (
                          <Badge variant="outline">{c.year}</Badge>
                        )}
                      </div>
                    </div>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No cases yet"
                description="Import your first case to get started."
                action={{
                  label: "Import Cases",
                  onClick: () => router.push("/ingestion"),
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Year Distribution */}
        <YearDistributionChart
          data={stats?.yearDistribution || []}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-6"
          onClick={() => router.push("/search")}
        >
          <Search className="h-6 w-6" />
          <span>Search</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-6"
          onClick={() => router.push("/ask")}
        >
          <BookOpen className="h-6 w-6" />
          <span>Ask AI</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-6"
          onClick={() => router.push("/saved")}
        >
          <BookOpen className="h-6 w-6" />
          <span>Saved</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-6"
          onClick={() => router.push("/ingestion")}
        >
          <Plus className="h-6 w-6" />
          <span>Import</span>
        </Button>
      </div>
    </div>
  );
}
