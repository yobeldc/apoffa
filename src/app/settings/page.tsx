"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { PrivacyToggle } from "@/components/privacy-toggle";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  async function handleSaveApiKey() {
    setSaveStatus("Saving...");
    // In production, this would save to backend
    setTimeout(() => {
      setSaveStatus("Saved!");
      setTimeout(() => setSaveStatus(null), 2000);
    }, 500);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose between light and dark mode.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Privacy Mode</p>
              <p className="text-sm text-muted-foreground">
                Hide sensitive case information from the interface.
              </p>
            </div>
            <PrivacyToggle />
          </div>

          <Separator />

          <div>
            <p className="font-medium">Data Storage</p>
            <p className="text-sm text-muted-foreground">
              All data is stored locally in your browser and on your
              self-hosted instance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">OpenAI API Key</label>
            <p className="text-sm text-muted-foreground">
              Required for AI-powered features like case breakdown and
              Q&A.
            </p>
            <div className="mt-2 flex gap-2">
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button onClick={handleSaveApiKey}>Save</Button>
            </div>
            {saveStatus && (
              <Badge variant="outline" className="mt-2">
                {saveStatus}
              </Badge>
            )}
          </div>

          <Separator />

          <div>
            <p className="font-medium">AI Model</p>
            <p className="text-sm text-muted-foreground">
              Currently using GPT-4 for case analysis and breakdown
              generation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>APOFF-AI</strong> - Automated Processing of Legal Documents
            with AI
          </p>
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          <p className="text-sm text-muted-foreground">
            A legal research platform powered by artificial intelligence.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
