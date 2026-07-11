/"use client"

import Link from "next/link"
import { useAuth } from "./auth-provider"
import { LogoutButton } from "./logout-button"

/**
 * UserNav
 * Displays user navigation: avatar, profile link, settings, logout.
 * Shown in the app header when user is authenticated.
 */
export function UserNav() {
  const { user, profile, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="w-24 h-4 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground
                     text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Get Started
        </Link>
      </div>
    )
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User"
  const avatarUrl = profile?.avatar_url

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center
                          text-primary font-medium text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium hidden sm:block">{displayName}</span>
      </div>

      <div className="h-4 w-px bg-border" />

      <LogoutButton variant="ghost" />
    </div>
  )
}
