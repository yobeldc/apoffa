/**
 * Worker Database Utilities
 * Handles: Supabase connections, typed queries, batch operations.
 * Runs in: Cloudflare Worker context.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Config } from './config'
import type { Database } from './types'

let supabaseClient: SupabaseClient<Database> | null = null

/**
 * Get or create a cached Supabase admin client.
 */
export function getSupabase(config: Config): SupabaseClient<Database> {
  if (supabaseClient) return supabaseClient

  supabaseClient = createClient<Database>(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  return supabaseClient
}

/**
 * Reset the cached client (useful for testing or error recovery).
 */
export function resetSupabase(): void {
  supabaseClient = null
}

/**
 * Health check for database connectivity.
 */
export async function checkDbHealth(config: Config): Promise<boolean> {
  try {
    const sb = getSupabase(config)
    const { error } = await sb.from('documents').select('id', { count: 'exact', head: true })
    return !error
  } catch {
    return false
  }
}
