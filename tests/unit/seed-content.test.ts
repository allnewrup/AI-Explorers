import { describe, expect, it } from "vitest"
import { WORLD_CATALOG } from "@/config/worlds"
import { seedId, validateSeedContent } from "../../supabase/seed/build-seed"
import { SEED_ACHIEVEMENTS, SEED_LESSONS } from "../../supabase/seed/content"

const EXPECTED_TITLES = [
  "What Is Artificial Intelligence?",
  "Can Machines Think Like Humans?",
  "How Does YouTube Recommend Videos?",
  "How Does Google Maps Use AI?",
  "Can AI Create a Photograph?",
  "How Can AI Help Us Write Stories?",
  "What Is a Deepfake?",
  "How Can We Check Whether Online Information Is Genuine?",
  "Why Should We Never Share Personal Information With AI?",
  "Can AI Make Mistakes?",
  "What Are AI Agents?",
  "How Do Robots Use AI?",
]

describe("sample curriculum", () => {
  it("passes its own validation rules", () => {
    expect(() => validateSeedContent()).not.toThrow()
  })

  it("contains the twelve lessons from the brief, in order, two per world", () => {
    expect(SEED_LESSONS.map((lesson) => lesson.title)).toEqual(EXPECTED_TITLES)
    for (const world of WORLD_CATALOG) {
      expect(SEED_LESSONS.filter((lesson) => lesson.worldSlug === world.slug)).toHaveLength(2)
    }
    expect(WORLD_CATALOG).toHaveLength(6)
  })

  it("gives every lesson five questions with four distinct choices and one correct answer", () => {
    for (const lesson of SEED_LESSONS) {
      expect(lesson.quiz.questions, lesson.slug).toHaveLength(5)
      for (const question of lesson.quiz.questions) {
        expect(question.options).toHaveLength(4)
        expect(question.options.filter((option) => option.correct)).toHaveLength(1)
        expect(question.explanation.length).toBeGreaterThan(20)
      }
    }
  })

  it("does not give the answer away by position", () => {
    const counts = [0, 0, 0, 0]
    for (const lesson of SEED_LESSONS) {
      for (const question of lesson.quiz.questions) {
        const index = question.options.findIndex((option) => option.correct)
        counts[index] = (counts[index] ?? 0) + 1
      }
    }
    // 60 questions: every position is used, and none is correct more than 40% of the time.
    for (const count of counts) {
      expect(count).toBeGreaterThanOrEqual(8)
      expect(count).toBeLessThanOrEqual(24)
    }
  })

  it("never invents media: no lesson claims to have a video", () => {
    for (const lesson of SEED_LESSONS) {
      expect(lesson).not.toHaveProperty("videoAssetKey")
      expect(JSON.stringify(lesson)).not.toMatch(/https?:\/\//)
    }
  })

  it("keeps each lesson's writing within the limits the database enforces", () => {
    for (const lesson of SEED_LESSONS) {
      expect(lesson.title.length).toBeLessThanOrEqual(120)
      expect(lesson.description.length).toBeLessThanOrEqual(600)
      for (const term of lesson.keyTerms) {
        expect(term.term.length).toBeLessThanOrEqual(80)
        expect(term.definition.length).toBeLessThanOrEqual(400)
      }
      for (const question of lesson.quiz.questions) {
        expect(question.question.length).toBeLessThanOrEqual(400)
        expect(question.explanation.length).toBeLessThanOrEqual(600)
        for (const option of question.options) expect(option.text.length).toBeLessThanOrEqual(240)
      }
    }
  })

  it("has achievements with increasing thresholds", () => {
    const thresholds = SEED_ACHIEVEMENTS.map((achievement) => achievement.pointsThreshold)
    expect(thresholds).toEqual([...thresholds].sort((a, b) => a - b))
    expect(new Set(SEED_ACHIEVEMENTS.map((achievement) => achievement.badgeKey)).size).toBe(SEED_ACHIEVEMENTS.length)
  })

  it("derives stable, well-formed ids", () => {
    expect(seedId("lesson:x")).toBe(seedId("lesson:x"))
    expect(seedId("lesson:x")).not.toBe(seedId("lesson:y"))
    expect(seedId("lesson:x")).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })
})
