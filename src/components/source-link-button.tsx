"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface SourceLinkButtonProps {
  url: string | null;
  sourceName?: string | null;
}

export function SourceLinkButton({ url, sourceName }: SourceLinkButtonProps) {
  if (!url) return null;

  return (
    <Button variant="outline" size="sm" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="mr-2 h-4 w-4" />
        {sourceName || "Source"}
      </a>
    </Button>
  );
}
