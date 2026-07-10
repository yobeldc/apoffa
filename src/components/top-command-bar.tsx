"use client";

import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function TopCommandBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <CommandPalette />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
