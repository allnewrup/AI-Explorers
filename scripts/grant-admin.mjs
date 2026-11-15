#!/usr/bin/env node
/**
 * Grants (or removes) the administrator role for an existing account.
 *
 *   npm run admin:grant -- parent@example.com
 *   npm run admin:grant -- parent@example.com --revoke
 *
 * Why a script? Administrator rights can never be obtained through the web
 * app: `profiles.role` is not writable by any signed-in user. The only way to
 * appoint an administrator is from a trusted environment that holds the
 * service-role key, which is what this script is.
 *
 * It needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, read from
 * the environment or from .env.local. It changes exactly one row.
 */
import { existsSync, readFileSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (!match || line.trim().startsWith("#")) continue
    const [, key, raw] = match
    if (process.env[key] === undefined) process.env[key] = raw.replace(/^["']|["']$/g, "")
  }
}

function fail(message) {
  console.error(`\n  ${message}\n`)
  process.exit(1)
}

loadEnvFile(".env.local")

const args = process.argv.slice(2)
const revoke = args.includes("--revoke")
const email = args.find((arg) => !arg.startsWith("--"))?.trim().toLowerCase()

if (!email || !email.includes("@")) {
  fail("Usage: npm run admin:grant -- <email> [--revoke]")
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  fail("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (in .env.local or the environment).")
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function findUserByEmail(target) {
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) fail(`Could not list users: ${error.message}`)
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === target)
    if (user) return user
    if (data.users.length < 200) return null
  }
  return null
}

const user = await findUserByEmail(email)
if (!user) {
  fail(`No account found for ${email}. The person must sign up in the app first.`)
}

const role = revoke ? "parent" : "admin"
const { data, error } = await supabase
  .from("profiles")
  .update({ role })
  .eq("id", user.id)
  .select("id, role, display_name")

if (error) fail(`Could not update the profile: ${error.message}`)
if (!data || data.length === 0) {
  fail("The account exists but has no profile row. Have the database migrations been applied?")
}

console.log(`\n  ${data[0].display_name} <${email}> now has the role "${data[0].role}".`)
console.log(
  revoke
    ? "  They can no longer open the admin area.\n"
    : "  They can open /admin after signing in (sign out and in again if already signed in).\n"
)
