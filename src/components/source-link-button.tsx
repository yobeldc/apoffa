/"use client"

/**
 * SourceLinkButton
 * Displays a clickable link to the original document source.
 */
interface SourceLinkButtonProps {
  url: string
  source: string
}

export function SourceLinkButton({ url, source }: SourceLinkButtonProps) {
  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border
                 text-sm hover:bg-muted transition-colors"
    >
      <ExternalLinkIcon className="w-3.5 h-3.5" />
      <span>View Source</span>
      <span className="text-xs text-muted-foreground">({source})</span>
    </a>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}
