import { z } from "zod"

const supabasePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({ protocol: /^https?$/ }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
})

export type SupabasePublicEnv = {
  url: string
  anonKey: string
}

type RawEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string | undefined
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string | undefined
}

/**
 * Reads the public Supabase configuration.
 *
 * Returns `null` when it is missing or malformed. Callers must treat `null` as
 * "not configured" and show the setup screen — there is deliberately no mock
 * or fallback backend.
 *
 * The `process.env.NEXT_PUBLIC_*` references are written out in full so that
 * Next.js can inline them.
 */
export function readSupabaseEnv(
  raw: RawEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
): SupabasePublicEnv | null {
  const parsed = supabasePublicEnvSchema.safeParse(raw)
  if (!parsed.success) return null
  return {
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

export function isSupabaseConfigured(): boolean {
  return readSupabaseEnv() !== null
}

/** Absolute origin used in auth e-mail links. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, "")
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return "http://localhost:3000"
}
