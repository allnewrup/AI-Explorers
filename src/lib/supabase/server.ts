import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { connection } from "next/server"
import { readSupabaseEnv } from "@/config/env"
import type { Database } from "@/types/database"

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example)."
    )
    this.name = "SupabaseNotConfiguredError"
  }
}

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * It uses the public (anon / publishable) key together with the signed-in
 * user's session cookies, so every query runs as that user and is filtered by
 * row-level security. The service-role key is never used by the web app.
 */
export async function createClient() {
  const env = readSupabaseEnv()
  if (!env) throw new SupabaseNotConfiguredError()

  // Session handling reads the clock (token expiry). Declaring a request-time
  // dependency keeps Next.js from trying to prerender or prefetch-render it.
  await connection()
  const cookieStore = await cookies()

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Components cannot write cookies. That is fine: src/proxy.ts
          // refreshes the session cookie on every request before rendering.
        }
      },
    },
  })
}

export type AppSupabaseClient = Awaited<ReturnType<typeof createClient>>
