"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrivacyToggle } from "./privacy-toggle";
import { ThemeToggle } from "./theme-toggle";

export function SettingsPrivacy() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Privacy Mode</p>
              <p className="text-sm text-muted-foreground">
                Hide sensitive case information from the interface.
              </p>
            </div>
            <PrivacyToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
