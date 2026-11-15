export const AGE_BANDS = ["5-7", "8-12", "13-15"] as const
export type AgeBand = (typeof AGE_BANDS)[number]

export const DEFAULT_AGE_BAND: AgeBand = "8-12"

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  "5-7": "Ages 5–7",
  "8-12": "Ages 8–12",
  "13-15": "Ages 13–15",
}

export const AGE_BAND_HINTS: Record<AgeBand, string> = {
  "5-7": "Early explorers. Lessons for this band are still being written.",
  "8-12": "Our launch age group. All sample lessons are written for this band.",
  "13-15": "Older explorers. Lessons for this band are still being written.",
}

export function isAgeBand(value: unknown): value is AgeBand {
  return typeof value === "string" && (AGE_BANDS as readonly string[]).includes(value)
}
