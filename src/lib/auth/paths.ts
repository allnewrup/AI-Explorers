import { GUEST_ONLY_PATHS, PROTECTED_PREFIXES, routes } from "@/config/site"

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

/** True for pages that need a signed-in parent or administrator. */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))
}

/** True for pages a signed-in user has no reason to see (login, sign-up). */
export function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PATHS.some((path) => matchesPrefix(pathname, path))
}

/**
 * Sanitises a "return to" path taken from the query string.
 *
 * Only same-site absolute paths are accepted. Anything that could send the
 * browser to another origin ("//evil.test", "/\\evil.test", "https://…") or
 * back into the auth pages falls back to the default.
 */
export function safeNextPath(next: unknown, fallback: string = routes.parent.dashboard): string {
  if (typeof next !== "string" || next.length === 0 || next.length > 512) return fallback
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback
  if (/[\u0000-\u001f]/.test(next)) return fallback

  let url: URL
  try {
    url = new URL(next, "http://internal.invalid")
  } catch {
    return fallback
  }
  if (url.origin !== "http://internal.invalid") return fallback
  if (isGuestOnlyPath(url.pathname) || matchesPrefix(url.pathname, "/auth")) return fallback

  return `${url.pathname}${url.search}`
}
