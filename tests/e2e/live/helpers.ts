import { existsSync, readFileSync } from "node:fs"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/** Reads .env.local into process.env without overriding what is already set. */
function loadEnvLocal() {
  if (!existsSync(".env.local")) return
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (!match || line.trim().startsWith("#")) continue
    const key = match[1] as string
    if (process.env[key] === undefined) process.env[key] = (match[2] ?? "").replace(/^["']|["']$/g, "")
  }
}

loadEnvLocal()

export type LiveEnv = { url: string; anonKey: string; serviceKey: string }

export function liveEnv(): LiveEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey) {
    throw new Error(
      "Live tests need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.local. See tests/e2e/live/README.md."
    )
  }
  return { url, anonKey, serviceKey }
}

const noSession = { auth: { persistSession: false, autoRefreshToken: false } }

/** Trusted client for test setup and clean-up only. Never given to the app. */
export function serviceClient(): SupabaseClient {
  const env = liveEnv()
  return createClient(env.url, env.serviceKey, noSession)
}

/** A client that behaves exactly like a signed-in browser: public key + user session. */
export async function signedInClient(email: string, password: string): Promise<SupabaseClient> {
  const env = liveEnv()
  const client = createClient(env.url, env.anonKey, noSession)
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`Could not sign in test user ${email}: ${error.message}`)
  return client
}

export function anonymousClient(): SupabaseClient {
  const env = liveEnv()
  return createClient(env.url, env.anonKey, noSession)
}

export type TestUser = { id: string; email: string; password: string }

const RUN_ID = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
export const TEST_PASSWORD = `Explorer-${RUN_ID}-42`

/** Creates an already-confirmed parent account for this test run. */
export async function createTestParent(label: string): Promise<TestUser> {
  const admin = serviceClient()
  const email = `aie-e2e-${label}-${RUN_ID}@example.com`
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: `E2E ${label}` },
  })
  if (error || !data.user) throw new Error(`Could not create test user: ${error?.message}`)
  return { id: data.user.id, email, password: TEST_PASSWORD }
}

/** Deletes a test account. Profiles, children and all learner rows cascade. */
export async function deleteTestUser(user: TestUser | undefined): Promise<void> {
  if (!user) return
  await serviceClient().auth.admin.deleteUser(user.id)
}

export async function createChildFor(client: SupabaseClient, displayName: string): Promise<string> {
  const { data, error } = await client.rpc("create_child_profile", {
    p_display_name: displayName,
    p_avatar_key: "rocket",
    p_age_band: "8-12",
    p_show_on_leaderboard: false,
    p_policy_version: "e2e-live",
  })
  if (error || !data) throw new Error(`Could not create child: ${error?.message}`)
  return data as string
}
