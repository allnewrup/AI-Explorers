/**
 * Sample data for the development-only design preview and for component
 * tests. Nothing here is used by a real page, and none of it describes a real
 * child: the "family" below is invented.
 */
import { getLevelProgress } from "@/config/gamification"
import { WORLD_CATALOG } from "@/config/worlds"
import type { ChildDashboardData } from "@/components/dashboards/child-dashboard-view"
import type { ParentChild } from "@/components/dashboards/parent-report-view"
import type { BadgeInfo } from "@/components/gamification/achievement-badge"
import type { LessonContent } from "@/components/lessons/lesson-view"
import type { LessonInput } from "@/features/admin-content/schemas"
import type { ChildReport } from "@/features/analytics/queries"
import type { WorldWithProgress } from "@/features/curriculum/queries"
import type { ChildSummary, DailyChallenge, Leaderboard } from "@/features/gamification/schemas"
import type { PathLesson } from "@/features/lessons/learning-path"
import type { QuizForPlay } from "@/features/lessons/queries"
import type { AttemptReview } from "@/features/quizzes/queries"
import { SEED_ACHIEVEMENTS, SEED_LESSONS } from "../../../supabase/seed/content"

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`

export const sampleChild: ParentChild = {
  id: uuid(1),
  displayName: "CosmicOtter42",
  avatarKey: "rocket",
  ageBand: "8-12",
  isActive: true,
  showOnLeaderboard: false,
  createdAt: "2026-11-02T09:30:00Z",
}

export const sampleSibling: ParentChild = {
  id: uuid(2),
  displayName: "BravePanda17",
  avatarKey: "planet",
  ageBand: "8-12",
  isActive: true,
  showOnLeaderboard: true,
  createdAt: "2026-11-05T16:10:00Z",
}

const completedSlugs = new Set([
  "what-is-artificial-intelligence",
  "can-machines-think-like-humans",
  "how-does-youtube-recommend-videos",
])
const inProgressSlugs = new Set(["how-does-google-maps-use-ai", "what-is-a-deepfake"])

export const samplePath: PathLesson[] = SEED_LESSONS.map((lesson, index) => {
  const world = WORLD_CATALOG.find((item) => item.slug === lesson.worldSlug)
  return {
    id: uuid(100 + index),
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    estimatedMinutes: lesson.estimatedMinutes,
    isSample: true,
    hasVideo: false,
    worldId: uuid(10 + (world?.displayOrder ?? 0)),
    worldTitle: world?.title ?? "",
    worldSlug: lesson.worldSlug,
    worldImageKey: world?.imageKey ?? "world-beginners",
    progress: completedSlugs.has(lesson.slug)
      ? "completed"
      : inProgressSlugs.has(lesson.slug)
        ? "in_progress"
        : "not_started",
    lastActivityAt: inProgressSlugs.has(lesson.slug) ? `2026-11-1${index}T10:00:00Z` : null,
  }
})

export const sampleWorlds: WorldWithProgress[] = WORLD_CATALOG.map((world) => {
  const lessons = samplePath.filter((lesson) => lesson.worldSlug === world.slug)
  return {
    id: uuid(10 + world.displayOrder),
    title: world.title,
    slug: world.slug,
    description: world.description,
    imageKey: world.imageKey,
    ageBand: world.ageBand,
    displayOrder: world.displayOrder,
    lessonCount: lessons.length,
    completedCount: lessons.filter((lesson) => lesson.progress === "completed").length,
  }
})

export const sampleSummary: ChildSummary = {
  total_xp: 165,
  weekly_xp: 70,
  lessons_started: 5,
  lessons_completed: 3,
  weekly_lessons_completed: 1,
  quiz_attempts: 4,
  weekly_quiz_attempts: 2,
  quizzes_passed: 3,
  questions_answered: 20,
  correct_answers: 16,
  accuracy_percent: 80,
  current_streak: 3,
  longest_streak: 5,
  last_learning_date: "2026-11-15",
  achievements_earned: 3,
}

export const emptySummary: ChildSummary = {
  total_xp: 0,
  weekly_xp: 0,
  lessons_started: 0,
  lessons_completed: 0,
  weekly_lessons_completed: 0,
  quiz_attempts: 0,
  weekly_quiz_attempts: 0,
  quizzes_passed: 0,
  questions_answered: 0,
  correct_answers: 0,
  accuracy_percent: null,
  current_streak: 0,
  longest_streak: 0,
  last_learning_date: null,
  achievements_earned: 0,
}

export const sampleAchievements: BadgeInfo[] = SEED_ACHIEVEMENTS.map((achievement) => ({
  title: achievement.title,
  description: achievement.description,
  badgeKey: achievement.badgeKey,
  pointsThreshold: achievement.pointsThreshold,
  earnedAt: achievement.pointsThreshold <= sampleSummary.total_xp ? "2026-11-12T10:00:00Z" : null,
}))

const firstLesson = SEED_LESSONS[0]
if (!firstLesson) throw new Error("seed content is empty")

export const sampleQuiz: QuizForPlay = {
  id: uuid(500),
  title: `Quiz: ${firstLesson.title}`,
  instructions: firstLesson.quiz.instructions,
  passingScore: firstLesson.quiz.passingScore,
  questions: firstLesson.quiz.questions.map((question, qIndex) => ({
    id: uuid(600 + qIndex),
    text: question.question,
    options: question.options.map((option, oIndex) => ({
      id: uuid(700 + qIndex * 10 + oIndex),
      text: option.text,
    })),
  })),
}

/** Answer key for the preview's stand-in "server". Preview and tests only. */
export const sampleQuizKey: Record<string, { correctOptionId: string; explanation: string }> =
  Object.fromEntries(
    firstLesson.quiz.questions.map((question, qIndex) => [
      uuid(600 + qIndex),
      {
        correctOptionId: uuid(700 + qIndex * 10 + question.options.findIndex((option) => option.correct)),
        explanation: question.explanation,
      },
    ])
  )

const challengeQuestion = sampleQuiz.questions[2]
if (!challengeQuestion) throw new Error("sample quiz is too short")

export const sampleChallenge: DailyChallenge = {
  challenge_date: "2026-11-15",
  xp_reward: 15,
  available: true,
  completed: false,
  question: {
    id: challengeQuestion.id,
    question_text: challengeQuestion.text,
    lesson_title: firstLesson.title,
    lesson_slug: firstLesson.slug,
    options: challengeQuestion.options.map((option) => ({ id: option.id, option_text: option.text })),
  },
  result: null,
}

export const sampleLeaderboard: Leaderboard = {
  week_start: "2026-11-09",
  entries: [
    { rank: 1, display_name: "SwiftFalcon21", avatar_key: "bolt", weekly_xp: 120, is_self: false },
    { rank: 2, display_name: "LunarTiger33", avatar_key: "star", weekly_xp: 95, is_self: false },
    { rank: 3, display_name: "CosmicOtter42", avatar_key: "rocket", weekly_xp: 70, is_self: true },
    { rank: 4, display_name: "ZippyGecko58", avatar_key: "atom", weekly_xp: 45, is_self: false },
  ],
  self: {
    rank: 3,
    weekly_xp: 70,
    visible_to_others: false,
    display_name: "CosmicOtter42",
    avatar_key: "rocket",
  },
}

const nextLesson = samplePath.find((lesson) => lesson.progress !== "completed") ?? null
const continueLesson = samplePath.find((lesson) => lesson.slug === "what-is-a-deepfake") ?? null

export const sampleDashboard: ChildDashboardData = {
  child: { displayName: sampleChild.displayName, avatarKey: sampleChild.avatarKey },
  level: getLevelProgress(sampleSummary.total_xp),
  summary: sampleSummary,
  todaysLesson: nextLesson,
  continueLesson,
  hasLessons: true,
  worlds: sampleWorlds,
  challenge: sampleChallenge,
  quizPreview: nextLesson
    ? {
        lessonSlug: nextLesson.slug,
        lessonTitle: nextLesson.title,
        questionCount: 5,
        firstQuestion: "How can a maps app tell that a road is busy?",
      }
    : null,
  achievements: sampleAchievements,
  leaderboard: sampleLeaderboard,
}

/** A brand-new child: nothing started, nothing earned. */
export const emptyDashboard: ChildDashboardData = {
  child: { displayName: "SunnyKoala14", avatarKey: "star" },
  level: getLevelProgress(0),
  summary: emptySummary,
  todaysLesson: samplePath[0] ? { ...samplePath[0], progress: "not_started", lastActivityAt: null } : null,
  continueLesson: null,
  hasLessons: true,
  worlds: sampleWorlds.map((world) => ({ ...world, completedCount: 0 })),
  challenge: sampleChallenge,
  quizPreview: null,
  achievements: sampleAchievements.map((achievement) => ({ ...achievement, earnedAt: null })),
  leaderboard: {
    week_start: "2026-11-09",
    entries: [],
    self: { rank: null, weekly_xp: 0, visible_to_others: false, display_name: "SunnyKoala14", avatar_key: "star" },
  },
}

export const sampleLesson: LessonContent = {
  id: uuid(100),
  title: firstLesson.title,
  description: firstLesson.description,
  ageBand: "8-12",
  difficulty: firstLesson.difficulty,
  estimatedMinutes: firstLesson.estimatedMinutes,
  learningObjectives: firstLesson.learningObjectives,
  transcript: firstLesson.transcript,
  keyTerms: firstLesson.keyTerms,
  keyTakeaways: firstLesson.keyTakeaways,
  advantages: firstLesson.advantages,
  limitations: firstLesson.limitations,
  safetyNotes: firstLesson.safetyNotes,
  isSample: true,
  worldTitle: "AI Beginners",
}

export const sampleAttempt: AttemptReview = {
  id: uuid(900),
  quizId: sampleQuiz.id,
  score: 80,
  totalQuestions: 5,
  correctAnswers: 4,
  completedAt: "2026-11-15T10:42:00Z",
  passingScore: 60,
  passed: true,
  responses: firstLesson.quiz.questions.map((question, index) => {
    const correct = question.options.find((option) => option.correct)
    const wrong = question.options.find((option) => !option.correct)
    const isCorrect = index !== 3
    return {
      id: uuid(910 + index),
      isCorrect,
      questionText: question.question,
      selectedOptionText: (isCorrect ? correct?.text : wrong?.text) ?? "",
      correctOptionText: correct?.text ?? "",
    }
  }),
}

export const sampleReport: ChildReport = {
  summary: sampleSummary,
  worlds: sampleWorlds.map((world) => ({
    worldId: world.id,
    title: world.title,
    imageKey: world.imageKey,
    completed: world.completedCount,
    total: world.lessonCount,
  })),
  history: [
    {
      kind: "quiz",
      id: "quiz-1",
      at: "2026-11-15T10:42:00Z",
      lessonTitle: "How Does YouTube Recommend Videos?",
      worldTitle: "AI in Everyday Life",
      score: 80,
      correctAnswers: 4,
      totalQuestions: 5,
    },
    {
      kind: "lesson",
      id: "lesson-1",
      at: "2026-11-15T10:31:00Z",
      lessonTitle: "How Does YouTube Recommend Videos?",
      worldTitle: "AI in Everyday Life",
    },
    {
      kind: "quiz",
      id: "quiz-2",
      at: "2026-11-13T17:05:00Z",
      lessonTitle: "Can Machines Think Like Humans?",
      worldTitle: "AI Beginners",
      score: 100,
      correctAnswers: 5,
      totalQuestions: 5,
    },
    {
      kind: "lesson",
      id: "lesson-2",
      at: "2026-11-13T16:52:00Z",
      lessonTitle: "Can Machines Think Like Humans?",
      worldTitle: "AI Beginners",
    },
  ],
}

export const emptyReport: ChildReport = {
  summary: emptySummary,
  worlds: sampleReport.worlds.map((world) => ({ ...world, completed: 0 })),
  history: [],
}

export const sampleLessonInput: LessonInput = {
  learning_world_id: uuid(11),
  title: firstLesson.title,
  slug: firstLesson.slug,
  description: firstLesson.description,
  age_band: "8-12",
  difficulty: firstLesson.difficulty,
  estimated_minutes: firstLesson.estimatedMinutes,
  display_order: 1,
  learning_objectives: firstLesson.learningObjectives,
  video_asset_key: "",
  captions_asset_key: "",
  transcript: firstLesson.transcript,
  key_terms: firstLesson.keyTerms,
  key_takeaways: firstLesson.keyTakeaways,
  advantages: firstLesson.advantages,
  limitations: firstLesson.limitations,
  safety_notes: firstLesson.safetyNotes,
  is_sample: true,
  quiz: {
    title: `Quiz: ${firstLesson.title}`,
    instructions: firstLesson.quiz.instructions,
    passing_score: firstLesson.quiz.passingScore,
    questions: firstLesson.quiz.questions.slice(0, 2).map((question, qIndex) => ({
      id: uuid(600 + qIndex),
      question_text: question.question,
      explanation: question.explanation,
      options: question.options.map((option, oIndex) => ({
        id: uuid(700 + qIndex * 10 + oIndex),
        option_text: option.text,
        is_correct: option.correct === true,
      })),
    })),
  },
}
