"use client";

import { AskApofPanel } from "@/components/ask-apof-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AskPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Ask APOFF-AI</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ask anything about legal cases</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ask natural language questions about the cases in the database.
            APOFF-AI will search through all available case law and provide
            answers with citations.
          </p>
        </CardContent>
      </Card>

      <AskApofPanel />
    </div>
  );
}
