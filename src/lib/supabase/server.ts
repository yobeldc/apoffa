/**
 * Supabase Client — Server
 *
 * Use this in Server Components, API routes, and server actions.
 * Manages cookies for session handling.
 *
 * Usage:
 *   import { createServerClient } from './server'
 *   const supabase = await createServerClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}
