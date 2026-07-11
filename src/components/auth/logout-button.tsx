/"use client"

import { useState } from "react"
import { useAuth } from "./auth-provider"

/**
 * LogoutButton
 * Handles user sign-out with loading state and confirmation.
 */
export function LogoutButton({
  variant = "default",
  className = "",
}: {
  variant?: "default" | "ghost" | "outline"
  className?: string
}) {
  const { signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to sign out?")) return

    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoading(false)
    }
  }

  const variantClasses = {
    default: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    ghost: "hover:bg-muted text-muted-foreground",
    outline: "border hover:bg-muted",
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? "Signing out..." : "Sign Out"}
    </button>
  )
}
