"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePrivacy } from "./privacy-provider";

export function PrivacyToggle() {
  const { privacyMode, togglePrivacy } = usePrivacy();

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="privacy-mode"
        checked={privacyMode}
        onCheckedChange={togglePrivacy}
      />
      <Label htmlFor="privacy-mode">Privacy Mode</Label>
    </div>
  );
}
