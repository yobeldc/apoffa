"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AskApofPanelProps {
  caseId?: string;
}

export function AskApofPanel({ caseId }: AskApofPanelProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<Array<{ caseId: string; text: string; score: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer(null);
    setSources([]);

    try {
      const response = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, caseId }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (error) {
      setAnswer(`Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ask APOFF-AI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question about this case..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <Button onClick={handleAsk} disabled={isLoading}>
            {isLoading ? "Thinking..." : "Ask"}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        )}

        {answer && !isLoading && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="whitespace-pre-wrap text-sm">{answer}</p>
            </div>

            {sources.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {sources.map((source, i) => (
                    <Badge key={i} variant="secondary">
                      {source.text.slice(0, 50)}...
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
