/**
 * Explorer names
 * --------------
 * A parent either picks a suggestion assembled from the two word lists below
 * plus a two-digit number (for example "CosmicOtter42") or types their own.
 *
 * A typed name must be 3–20 letters or numbers, with single spaces between
 * words, at least one letter, and none of the blocked words. The same rules
 * are enforced by a CHECK constraint in the database
 * (`app_private.is_valid_explorer_name`); database tests assert both copies
 * agree — change them together.
 */
export const EXPLORER_ADJECTIVES = [
  "Brave",
  "Bright",
  "Clever",
  "Cosmic",
  "Curious",
  "Daring",
  "Gentle",
  "Happy",
  "Jolly",
  "Lucky",
  "Lunar",
  "Mighty",
  "Nimble",
  "Quantum",
  "Solar",
  "Sparkly",
  "Stellar",
  "Sunny",
  "Swift",
  "Turbo",
  "Witty",
  "Zippy",
] as const

export const EXPLORER_NOUNS = [
  "Badger",
  "Comet",
  "Dolphin",
  "Dragon",
  "Falcon",
  "Fox",
  "Gecko",
  "Hawk",
  "Koala",
  "Lynx",
  "Otter",
  "Owl",
  "Panda",
  "Penguin",
  "Pilot",
  "Planet",
  "Ranger",
  "Robot",
  "Rocket",
  "Tiger",
  "Turtle",
  "Wizard",
] as const

export const EXPLORER_NAME_MIN_LENGTH = 3
export const EXPLORER_NAME_MAX_LENGTH = 20

/** Letters and digits, single spaces between words, no leading or trailing space. */
const NAME_PATTERN = /^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/

/**
 * Rejected anywhere in a name (case-insensitive, spaces ignored). Kept short
 * and unambiguous on purpose; the database copy must match.
 */
export const BLOCKED_NAME_WORDS = [
  "bastard",
  "bitch",
  "cock",
  "cunt",
  "dick",
  "fag",
  "fuck",
  "hitler",
  "nazi",
  "nigg",
  "penis",
  "porn",
  "pussy",
  "rape",
  "sex",
  "shit",
  "slut",
  "twat",
  "vagina",
  "wank",
  "whore",
] as const

export const EXPLORER_NAME_RULES =
  "Use 3–20 letters or numbers (single spaces are fine) and keep it friendly."

export function isValidExplorerName(name: string): boolean {
  if (name.length < EXPLORER_NAME_MIN_LENGTH || name.length > EXPLORER_NAME_MAX_LENGTH) return false
  if (!NAME_PATTERN.test(name) || !/[A-Za-z]/.test(name)) return false
  const squashed = name.replaceAll(" ", "").toLowerCase()
  return !BLOCKED_NAME_WORDS.some((word) => squashed.includes(word))
}

/**
 * Builds a name from a random source returning numbers in [0, 1).
 * The source is injectable so the function is deterministic under test.
 */
export function generateExplorerName(random: () => number = Math.random): string {
  const pick = <T,>(items: readonly T[]): T => {
    const index = Math.min(items.length - 1, Math.floor(random() * items.length))
    return items[index] as T
  }
  const number = 10 + Math.min(89, Math.floor(random() * 90))
  return `${pick(EXPLORER_ADJECTIVES)}${pick(EXPLORER_NOUNS)}${number}`
}

export function generateExplorerNameOptions(
  count: number,
  random: () => number = Math.random
): string[] {
  const names = new Set<string>()
  let guard = 0
  while (names.size < count && guard < count * 20) {
    names.add(generateExplorerName(random))
    guard += 1
  }
  return [...names]
}
