/**
 * Auth Provider
 * Wraps the application with Supabase auth state management.
 * Handles: Session initialization, auth state changes, user context.
 */

'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// ── Types ───────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Database['public']['Tables']['profiles']['Row'] | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// ── Context ─────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ── Hook ────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ── Provider ────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AuthContextValue['profile']>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.warn('Failed to fetch profile:', error)
      return null
    }

    return data
  }

  // Refresh profile manually
  const refreshProfile = async () => {
    if (!user) return
    const profileData = await fetchProfile(user.id)
    setProfile(profileData)
  }

  // Sign out handler
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    // Hard refresh to clear all state
    window.location.href = '/login'
  }

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      setIsLoading(true)

      const { data: { session: initialSession } } = await supabase.auth.getSession()

      setSession(initialSession)
      setUser(initialSession?.user ?? null)

      if (initialSession?.user) {
        const profileData = await fetchProfile(initialSession.user.id)
        setProfile(profileData)
      }

      setIsLoading(false)
    }

    initSession()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          const profileData = await fetchProfile(currentSession.user.id)
          setProfile(profileData)
        } else {
          setProfile(null)
        }

        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextValue = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
