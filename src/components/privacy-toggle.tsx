/"use client"

import { useState } from "react"

/**
 * PrivacyToggle
 * Toggle for enabling/disabling data collection for AI improvement.
 */
export function PrivacyToggle() {
  const [enabled, setEnabled] = useState(false)

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
      <div className="flex-1">
        <h3 className="font-medium">Kontribusi Data AI</h3>
        <p className="text-sm text-muted-foreground">
          Izinkan penggunaan data anonim untuk meningkatkan model AI.
        </p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  )
}
