import type { AgeBand } from "@/config/age-bands"

export const WORLD_IMAGE_KEYS = [
  "world-beginners",
  "world-everyday",
  "world-creativity",
  "world-detective",
  "world-safety",
  "world-future",
] as const

export type WorldImageKey = (typeof WORLD_IMAGE_KEYS)[number]

export function isWorldImageKey(value: unknown): value is WorldImageKey {
  return typeof value === "string" && (WORLD_IMAGE_KEYS as readonly string[]).includes(value)
}

export type WorldCatalogEntry = {
  slug: string
  title: string
  description: string
  imageKey: WorldImageKey
  ageBand: AgeBand
  displayOrder: number
}

/**
 * The six launch learning worlds.
 *
 * This is the single source for (a) the public landing page, which must render
 * without a database, and (b) the seed generator in scripts/generate-seed.ts.
 * Signed-in pages read worlds from the database instead.
 */
export const WORLD_CATALOG: readonly WorldCatalogEntry[] = [
  {
    slug: "ai-beginners",
    title: "AI Beginners",
    description:
      "Start here! Find out what artificial intelligence really is and how machines learn from examples.",
    imageKey: "world-beginners",
    ageBand: "8-12",
    displayOrder: 1,
  },
  {
    slug: "ai-in-everyday-life",
    title: "AI in Everyday Life",
    description:
      "Spot the AI hiding in plain sight, from video suggestions to the maps that guide a car journey.",
    imageKey: "world-everyday",
    ageBand: "8-12",
    displayOrder: 2,
  },
  {
    slug: "ai-creativity-studio",
    title: "AI Creativity Studio",
    description:
      "See how AI can help make pictures and stories, and why your own ideas still matter most.",
    imageKey: "world-creativity",
    ageBand: "8-12",
    displayOrder: 3,
  },
  {
    slug: "ai-detective-lab",
    title: "AI Detective Lab",
    description:
      "Become a fact detective. Learn to question what you see online and check whether it is genuine.",
    imageKey: "world-detective",
    ageBand: "8-12",
    displayOrder: 4,
  },
  {
    slug: "ai-safety-school",
    title: "AI Safety School",
    description:
      "Learn the golden rules for using AI safely: protect your information and double-check answers.",
    imageKey: "world-safety",
    ageBand: "8-12",
    displayOrder: 5,
  },
  {
    slug: "ai-future-lab",
    title: "AI Future Lab",
    description:
      "Peek at what comes next: AI helpers that carry out tasks and robots that sense the world.",
    imageKey: "world-future",
    ageBand: "8-12",
    displayOrder: 6,
  },
] as const
