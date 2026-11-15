/**
 * Cookie holding the id of the child profile currently in use.
 *
 * It is only a *selector*. It grants nothing: on every request the id is looked
 * up among the signed-in parent's own children (through row-level security),
 * so changing it by hand can at most pick another of your own children.
 */
export const ACTIVE_CHILD_COOKIE = "aie_active_child"

export const ACTIVE_CHILD_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export const NOT_CONFIGURED_MESSAGE =
  "Supabase is not configured for this deployment yet, so accounts are unavailable."
