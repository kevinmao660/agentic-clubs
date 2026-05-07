import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Server-only Supabase client. Prefer `SUPABASE_SERVICE_ROLE_KEY` for API routes;
 * falls back to the anon key when RLS is not enabled (local dev).
 */
export function createServiceSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and a Supabase key (service role or anon)."
    )
  }

  return createClient(url, key)
}
