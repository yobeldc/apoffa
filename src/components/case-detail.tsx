"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CaseBreakdownPanel } from "./case-breakdown-panel";
import { AskApofPanel } from "./ask-apof-panel";
import { SaveCaseButton } from "./save-case-button";
import { DataQualityBadge } from "./data-quality-badge";
import { formatDate } from "@/lib/utils";

interface Case {
  id: string;
  title: string;
  date: string | null;
  court: string | null;
  judges: string | null;
  parties: string | null;
  summary: string | null;
  content: string | null;
  year: number | null;
  caseType: string | null;
  sourceName: string | null;
  dataQuality: string | null;
  breakdown: {
    facts: string;
    issues: string;
    holdings: string;
    reasoning: string;
    dissent: string;
    significance: string;
  } | null;
  paragraphs: Array<{
    id: string;
    number: number;
    text: string;
    classification: string | null;
  }>;
  citations: Array<{
    id: string;
    citedCase: string;
    context: string | null;
  }>;
}

export function CaseDetail() {
  const params = useParams();
  const caseId = params.id as string;
  const [case_, setCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"breakdown" | "fulltext" | "citations">("breakdown");

  useEffect(() => {
    async function fetchCase() {
      try {
        const response = await fetch(`/api/cases/${caseId}`);
        if (response.ok) {
          const data = await response.json();
          setCase(data);
        }
      } catch (error) {
        console.error("Failed to fetch case:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCase();
  }, [caseId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
      </div>
    );
  }

  if (!case_) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Case not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{case_.title}</h1>
          <div className="flex flex-wrap gap-2">
            {case_.court && <Badge variant="outline">{case_.court}</Badge>}
            {case_.year && <Badge variant="secondary">{case_.year}</Badge>}
            {case_.caseType && <Badge>{case_.caseType}</Badge>}
            {case_.dataQuality && <DataQualityBadge quality={case_.dataQuality} />}
          </div>
          <p className="text-sm text-muted-foreground">
            {case_.date && formatDate(case_.date)}
            {case_.judges && ` | Judges: ${case_.judges}`}
            {case_.parties && ` | ${case_.parties}`}
          </p>
        </div>
        <SaveCaseButton caseId={case_.id} />
      </div>

      {/* Summary */}
      {case_.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{case_.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "breakdown" ? "default" : "ghost"}
          onClick={() => setActiveTab("breakdown")}
        >
          AI Breakdown
        </Button>
        <Button
          variant={activeTab === "fulltext" ? "default" : "ghost"}
          onClick={() => setActiveTab("fulltext")}
        >
          Full Text
        </Button>
        <Button
          variant={activeTab === "citations" ? "default" : "ghost"}
          onClick={() => setActiveTab("citations")}
        >
          Citations ({case_.citations.length})
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "breakdown" && (
        <div className="space-y-4">
          <CaseBreakdownPanel caseId={caseId} />
          <AskApofPanel caseId={caseId} />
        </div>
      )}

      {activeTab === "fulltext" && (
        <Card>
          <CardContent className="pt-6">
            {case_.paragraphs.length > 0 ? (
              <div className="space-y-4">
                {case_.paragraphs.map((para) => (
                  <div key={para.id} className="text-sm leading-relaxed">
                    <span className="mr-2 text-xs text-muted-foreground">[{para.number}]</span>
                    {para.text}
                  </div>
                ))}
              </div>
            ) : case_.content ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{case_.content}</p>
            ) : (
              <p className="text-muted-foreground">No full text available.</p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "citations" && (
        <Card>
          <CardContent className="pt-6">
            {case_.citations.length > 0 ? (
              <ul className="space-y-3">
                {case_.citations.map((citation) => (
                  <li key={citation.id} className="text-sm">
                    <span className="font-medium">{citation.citedCase}</span>
                    {citation.context && (
                      <p className="mt-1 text-muted-foreground">{citation.context}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No citations available.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
