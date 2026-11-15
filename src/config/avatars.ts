export const AVATAR_KEYS = [
  "rocket",
  "star",
  "planet",
  "comet",
  "atom",
  "telescope",
  "satellite",
  "bolt",
] as const

export type AvatarKey = (typeof AVATAR_KEYS)[number]

export const DEFAULT_AVATAR_KEY: AvatarKey = "rocket"

export const AVATAR_LABELS: Record<AvatarKey, string> = {
  rocket: "Rocket",
  star: "Star",
  planet: "Planet",
  comet: "Comet",
  atom: "Atom",
  telescope: "Telescope",
  satellite: "Satellite",
  bolt: "Lightning bolt",
}

export function isAvatarKey(value: unknown): value is AvatarKey {
  return typeof value === "string" && (AVATAR_KEYS as readonly string[]).includes(value)
}

export function toAvatarKey(value: unknown): AvatarKey {
  return isAvatarKey(value) ? value : DEFAULT_AVATAR_KEY
}
