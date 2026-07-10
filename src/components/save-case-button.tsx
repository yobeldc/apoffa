"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

interface SaveCaseButtonProps {
  caseId: string;
}

export function SaveCaseButton({ caseId }: SaveCaseButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkSaved() {
      try {
        const response = await fetch("/api/saved");
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.some((s: { caseId: string }) => s.caseId === caseId));
        }
      } catch (error) {
        console.error("Failed to check saved status:", error);
      }
    }

    checkSaved();
  }, [caseId]);

  async function toggleSave() {
    setIsLoading(true);

    try {
      if (isSaved) {
        await fetch(`/api/saved?id=${caseId}`, { method: "DELETE" });
        setIsSaved(false);
      } else {
        await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId }),
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size="sm"
      onClick={toggleSave}
      disabled={isLoading}
    >
      <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
