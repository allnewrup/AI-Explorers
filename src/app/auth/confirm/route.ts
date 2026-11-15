import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { isSupabaseConfigured } from "@/config/env"
import { routes } from "@/config/site"
import { safeNextPath } from "@/lib/auth/paths"
import { createClient } from "@/lib/supabase/server"

const OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]

/**
 * Landing point for links in Supabase Auth e-mails (confirm sign-up, reset
 * password). Supports both link styles Supabase can send:
 *   ?code=…                    (default templates, PKCE)
 *   ?token_hash=…&type=…       (custom templates)
 * On success the visitor continues to a same-site `next` path.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = safeNextPath(searchParams.get("next"), routes.parent.dashboard)
  const failure = new URL(`${routes.login}?notice=link-invalid`, origin)

  if (!isSupabaseConfigured()) return NextResponse.redirect(failure)

  const supabase = await createClient()
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, origin))
  } else if (tokenHash && type && (OTP_TYPES as readonly string[]).includes(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    })
    if (!error) return NextResponse.redirect(new URL(next, origin))
  }

  return NextResponse.redirect(failure)
}
