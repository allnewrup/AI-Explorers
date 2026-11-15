import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { readSupabaseEnv } from "@/config/env"
import { routes } from "@/config/site"
import { isGuestOnlyPath, isProtectedPath } from "@/lib/auth/paths"
import type { Database } from "@/types/database"

/**
 * Runs on every matched request (see src/proxy.ts).
 *
 * 1. Refreshes the Supabase session cookie so Server Components always see a
 *    valid token.
 * 2. Performs an *optimistic* redirect: signed-out visitors are sent to the
 *    login page before a protected page starts rendering.
 *
 * This is a convenience, not the security boundary. Every page and action
 * re-verifies the user (src/lib/auth/session.ts) and the database enforces
 * access with row-level security.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const env = readSupabaseEnv()
  if (!env) {
    // Not configured: let the request through. Protected layouts render the
    // "Supabase is not configured" screen instead of pretending to work.
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value)
        }
      },
    },
  })

  // Do not put code between createServerClient and getClaims(): this call is
  // what refreshes an expired session.
  const { data } = await supabase.auth.getClaims()
  const isSignedIn = Boolean(data?.claims?.sub)
  const { pathname, search } = request.nextUrl

  const redirectTo = (path: string, params?: Record<string, string>) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.search = ""
    for (const [key, value] of Object.entries(params ?? {})) url.searchParams.set(key, value)
    const redirect = NextResponse.redirect(url)
    // Carry over any refreshed session cookies.
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie)
    return redirect
  }

  if (!isSignedIn && isProtectedPath(pathname)) {
    return redirectTo(routes.login, { next: `${pathname}${search}` })
  }
  if (isSignedIn && isGuestOnlyPath(pathname)) {
    return redirectTo(routes.parent.dashboard)
  }

  return response
}
