/**
 * Supabase Admin Client
 *
 * Use this for service-role operations (bypasses RLS).
 * ONLY use server-side — never expose to the browser.
 *
 * Usage:
 *   import { createAdminClient } from './admin'
 *   const admin = createAdminClient()
 *   const { data } = await admin.auth.admin.listUsers()
 */

import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
