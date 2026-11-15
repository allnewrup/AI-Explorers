export type SeedOption = {
  text: string
  /** Exactly one option per question is marked correct. */
  correct?: true
}

export type SeedQuestion = {
  question: string
  options: SeedOption[]
  /** Shown to the child after they answer. */
  explanation: string
}

export type SeedKeyTerm = {
  term: string
  definition: string
}

export type SeedLesson = {
  worldSlug: string
  slug: string
  title: string
  description: string
  estimatedMinutes: number
  difficulty: "beginner" | "intermediate" | "advanced"
  learningObjectives: string[]
  /** The lesson narration. Paragraphs are separated by a blank line. */
  transcript: string
  keyTerms: SeedKeyTerm[]
  keyTakeaways: string[]
  advantages: string[]
  limitations: string[]
  safetyNotes: string[]
  quiz: {
    instructions: string
    passingScore: number
    questions: SeedQuestion[]
  }
}

export type SeedAchievement = {
  badgeKey: string
  title: string
  description: string
  pointsThreshold: number
}
