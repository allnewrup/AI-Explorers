import type { SeedAchievement, SeedLesson } from "../types"
import { aiBeginnersLessons } from "./01-ai-beginners"
import { aiInEverydayLifeLessons } from "./02-ai-in-everyday-life"
import { aiCreativityStudioLessons } from "./03-ai-creativity-studio"
import { aiDetectiveLabLessons } from "./04-ai-detective-lab"
import { aiSafetySchoolLessons } from "./05-ai-safety-school"
import { aiFutureLabLessons } from "./06-ai-future-lab"

/**
 * Original sample curriculum written for AI Explorers (ages 8–12).
 *
 * Every lesson here is seeded as `is_sample = true` and shown in the app with
 * a "Sample lesson" label. No lesson has a video: `video_asset_key` is left
 * NULL so the app shows its "video coming soon" state instead of a fake player.
 *
 * This content has not been reviewed by a qualified educator. Have it reviewed
 * before using it with children outside a demonstration.
 */
export const SEED_LESSONS: SeedLesson[] = [
  ...aiBeginnersLessons,
  ...aiInEverydayLifeLessons,
  ...aiCreativityStudioLessons,
  ...aiDetectiveLabLessons,
  ...aiSafetySchoolLessons,
  ...aiFutureLabLessons,
]

export const SEED_ACHIEVEMENTS: SeedAchievement[] = [
  {
    badgeKey: "first-steps",
    title: "First Steps",
    description: "Earn your first 10 XP.",
    pointsThreshold: 10,
  },
  {
    badgeKey: "curious-mind",
    title: "Curious Mind",
    description: "Reach 50 XP by finishing lessons and quizzes.",
    pointsThreshold: 50,
  },
  {
    badgeKey: "pattern-spotter",
    title: "Pattern Spotter",
    description: "Reach 120 XP. You are spotting how AI works!",
    pointsThreshold: 120,
  },
  {
    badgeKey: "fact-detective",
    title: "Fact Detective",
    description: "Reach 250 XP. You check before you believe.",
    pointsThreshold: 250,
  },
  {
    badgeKey: "safety-star",
    title: "Safety Star",
    description: "Reach 400 XP. You know how to use AI safely.",
    pointsThreshold: 400,
  },
  {
    badgeKey: "future-ready",
    title: "Future Ready",
    description: "Reach 650 XP. You are ready for what comes next.",
    pointsThreshold: 650,
  },
]
