/"use client"

/**
 * Global Loading UI
 * Shown while route segments are loading.
 * Features: Animated skeleton screens, progressive loading indicators.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      {/* Main spinner */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>

      {/* Loading text with animated dots */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-medium text-foreground">Loading</p>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      {/* Skeleton placeholder */}
      <div className="w-full max-w-md space-y-3 mt-8">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4 mx-auto" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2 mx-auto" />
        <div className="h-4 bg-muted rounded animate-pulse w-2/3 mx-auto" />
      </div>
    </div>
  )
}
