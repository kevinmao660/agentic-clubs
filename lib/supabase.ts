import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const BROWSER_SINGLETON_KEY = "__hermesSupabaseBrowser"

function createConfiguredClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local."
    )
  }

  return createClient(url, anonKey)
}

/**
 * Browser / server usage with the **anon** key (respects RLS once you enable it).
 * Use the service-role key only in trusted server environments — never expose it to the client.
 */
export function createSupabaseClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    const g = globalThis as unknown as Record<
      string,
      SupabaseClient | undefined
    >
    if (!g[BROWSER_SINGLETON_KEY]) {
      g[BROWSER_SINGLETON_KEY] = createConfiguredClient()
    }
    return g[BROWSER_SINGLETON_KEY]
  }

  return createConfiguredClient()
}
