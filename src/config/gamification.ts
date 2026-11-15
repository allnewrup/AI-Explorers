/**
 * XP rules shown in the interface.
 *
 * The authoritative values live in the database (`app_private.xp_*` functions
 * in supabase/migrations) because points are only ever awarded there. The
 * database test-suite asserts that the two stay in sync.
 */
export const XP_RULES = {
  lessonCompleted: 10,
  quizCompleted: 5,
  quizCorrectAnswer: 10,
  dailyChallenge: 15,
} as const

export type Level = {
  level: number
  title: string
  minXp: number
}

export const LEVELS: readonly Level[] = [
  { level: 1, title: "Curious Cadet", minXp: 0 },
  { level: 2, title: "Data Scout", minXp: 50 },
  { level: 3, title: "Pattern Finder", minXp: 120 },
  { level: 4, title: "Robot Ranger", minXp: 220 },
  { level: 5, title: "Code Navigator", minXp: 350 },
  { level: 6, title: "AI Detective", minXp: 500 },
  { level: 7, title: "Future Builder", minXp: 700 },
  { level: 8, title: "Master Explorer", minXp: 950 },
] as const

export type LevelProgress = {
  level: number
  title: string
  totalXp: number
  /** XP earned since reaching the current level. */
  xpIntoLevel: number
  /** XP needed to go from the current level to the next; null at max level. */
  xpForNextLevel: number | null
  /** XP still missing for the next level; null at max level. */
  xpRemaining: number | null
  nextTitle: string | null
  /** 0–100. Always 100 at max level. */
  percent: number
  isMaxLevel: boolean
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const xp = Number.isFinite(totalXp) ? Math.max(0, Math.floor(totalXp)) : 0
  let index = 0
  for (let i = 0; i < LEVELS.length; i += 1) {
    const candidate = LEVELS[i]
    if (candidate && xp >= candidate.minXp) index = i
  }
  const current = LEVELS[index] ?? { level: 1, title: "Curious Cadet", minXp: 0 }
  const next = LEVELS[index + 1]
  const xpIntoLevel = xp - current.minXp

  if (!next) {
    return {
      level: current.level,
      title: current.title,
      totalXp: xp,
      xpIntoLevel,
      xpForNextLevel: null,
      xpRemaining: null,
      nextTitle: null,
      percent: 100,
      isMaxLevel: true,
    }
  }

  const span = next.minXp - current.minXp
  return {
    level: current.level,
    title: current.title,
    totalXp: xp,
    xpIntoLevel,
    xpForNextLevel: span,
    xpRemaining: next.minXp - xp,
    nextTitle: next.title,
    percent: Math.min(100, Math.round((xpIntoLevel / span) * 100)),
    isMaxLevel: false,
  }
}

/** Maximum child profiles per parent account. Enforced in the database. */
export const MAX_CHILD_PROFILES = 6

/** Number of questions the CMS recommends for each quiz. */
export const RECOMMENDED_QUIZ_LENGTH = 5
