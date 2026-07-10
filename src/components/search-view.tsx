"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CaseResultCard } from "./case-result-card";

interface Case {
  id: string;
  title: string;
  court: string | null;
  year: number | null;
  date: string | null;
  summary: string | null;
  caseType: string | null;
  dataQuality: string | null;
}

export function SearchView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Case[]>([]);
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Search Cases</h1>
        <p className="text-muted-foreground">
          Search across all legal cases in the database.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search by title, court, parties, content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {hasSearched && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{results.length} results</Badge>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((c) => (
          <CaseResultCard
            key={c.id}
            {...c}
            onClick={() => router.push(`/cases/${c.id}`)}
          />
        ))}
      </div>

      {hasSearched && results.length === 0 && (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No cases found matching your search.
        </div>
      )}
    </div>
  );
}
