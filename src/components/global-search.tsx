"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CaseResultCard } from "./case-result-card";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  title: string;
  court: string | null;
  year: number | null;
  date: string | null;
  summary: string | null;
  caseType: string | null;
  dataQuality: string | null;
}

interface GlobalSearchProps {
  initialQuery?: string;
}

export function GlobalSearch({ initialQuery = "" }: GlobalSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  async function handleSearch() {
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.cases || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search cases, courts, parties..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {hasSearched && !isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{results.length} results</Badge>
          {query && <span>for "{query}"</span>}
        </div>
      )}

      <div className="grid gap-4">
        {results.map((result) => (
          <CaseResultCard
            key={result.id}
            {...result}
            onClick={() => router.push(`/cases/${result.id}`)}
          />
        ))}
      </div>

      {hasSearched && !isLoading && results.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No cases found. Try a different search term.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
