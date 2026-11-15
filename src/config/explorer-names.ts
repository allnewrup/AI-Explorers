/**
 * Explorer names
 * --------------
 * Child display names are assembled from these two fixed word lists plus a
 * two-digit number (for example "CosmicOtter42"). Nobody types a free-text
 * name, so real names and inappropriate words cannot reach shared screens such
 * as the leaderboard.
 *
 * The same lists are enforced by a CHECK constraint in the database
 * (`app_private.is_valid_explorer_name`). A database test asserts both copies
 * are identical — change them together.
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

const NAME_PATTERN = /^([A-Z][a-z]+)([A-Z][a-z]+)([0-9]{2})$/

export function isValidExplorerName(name: string): boolean {
  const match = NAME_PATTERN.exec(name)
  if (!match) return false
  const [, adjective, noun] = match
  return (
    (EXPLORER_ADJECTIVES as readonly string[]).includes(adjective ?? "") &&
    (EXPLORER_NOUNS as readonly string[]).includes(noun ?? "")
  )
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
