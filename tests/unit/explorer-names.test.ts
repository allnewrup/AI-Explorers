import { describe, expect, it } from "vitest"
import {
  EXPLORER_ADJECTIVES,
  EXPLORER_NOUNS,
  generateExplorerName,
  generateExplorerNameOptions,
  isValidExplorerName,
} from "@/config/explorer-names"

/** Small deterministic generator so the tests do not depend on Math.random. */
function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

describe("explorer names", () => {
  it("always generates a name that passes validation", () => {
    const random = seeded(42)
    for (let i = 0; i < 500; i += 1) {
      const name = generateExplorerName(random)
      expect(isValidExplorerName(name), name).toBe(true)
      expect(name).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[1-9][0-9]$/)
    }
  })

  it("handles the extremes of the random source", () => {
    expect(isValidExplorerName(generateExplorerName(() => 0))).toBe(true)
    expect(isValidExplorerName(generateExplorerName(() => 0.999999))).toBe(true)
  })

  it("offers distinct suggestions", () => {
    const options = generateExplorerNameOptions(6, seeded(7))
    expect(options).toHaveLength(6)
    expect(new Set(options).size).toBe(6)
  })

  it.each([
    "Mia Carter",
    "mia",
    "CosmicOtter",
    "CosmicOtter4",
    "CosmicOtter420",
    "cosmicotter42",
    "CosmicOtter42 ",
    "HackerDude99",
    "CosmicHacker42",
    "<b>CosmicOtter42</b>",
    "",
  ])("rejects %j", (name) => {
    expect(isValidExplorerName(name)).toBe(false)
  })

  it("uses word lists that fit the database pattern (capital letter, then lowercase)", () => {
    for (const word of [...EXPLORER_ADJECTIVES, ...EXPLORER_NOUNS]) {
      expect(word).toMatch(/^[A-Z][a-z]+$/)
    }
    expect(new Set(EXPLORER_ADJECTIVES).size).toBe(EXPLORER_ADJECTIVES.length)
    expect(new Set(EXPLORER_NOUNS).size).toBe(EXPLORER_NOUNS.length)
  })
})
