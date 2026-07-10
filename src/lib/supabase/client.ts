/**
 * Supabase Client — Browser
 *
 * Use this in client components for auth operations.
 * Automatically handles session refresh and token management.
 *
 * Usage:
 *   import { createBrowserClient } from './client'
 *   const supabase = createBrowserClient()
 *   const { data } = await supabase.auth.getSession()
 */

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
