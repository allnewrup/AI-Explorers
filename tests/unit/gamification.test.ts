import { describe, expect, it } from "vitest"
import { getLevelProgress, LEVELS, XP_RULES } from "@/config/gamification"

describe("XP rules", () => {
  it("match the product brief", () => {
    expect(XP_RULES).toEqual({
      lessonCompleted: 10,
      quizCompleted: 5,
      quizCorrectAnswer: 10,
      dailyChallenge: 15,
    })
  })
})

describe("getLevelProgress", () => {
  it("starts a new explorer at level 1 with nothing earned", () => {
    expect(getLevelProgress(0)).toMatchObject({
      level: 1,
      xpIntoLevel: 0,
      percent: 0,
      isMaxLevel: false,
      xpRemaining: 50,
    })
  })

  it("levels up exactly on each threshold", () => {
    for (const level of LEVELS) {
      expect(getLevelProgress(level.minXp).level).toBe(level.level)
      if (level.minXp > 0) expect(getLevelProgress(level.minXp - 1).level).toBe(level.level - 1)
    }
  })

  it("reports progress towards the next level", () => {
    // Level 2 spans 50–119 XP.
    expect(getLevelProgress(85)).toMatchObject({
      level: 2,
      xpIntoLevel: 35,
      xpForNextLevel: 70,
      xpRemaining: 35,
      percent: 50,
      nextTitle: "Pattern Finder",
    })
  })

  it("caps at the top level", () => {
    const top = getLevelProgress(1_000_000)
    expect(top).toMatchObject({ level: LEVELS.length, isMaxLevel: true, percent: 100, xpRemaining: null })
  })

  it("never goes backwards as XP grows", () => {
    let previous = 0
    for (let xp = 0; xp <= 1200; xp += 7) {
      const { level } = getLevelProgress(xp)
      expect(level).toBeGreaterThanOrEqual(previous)
      previous = level
    }
  })

  it.each([-50, Number.NaN, Number.POSITIVE_INFINITY])("treats %s as zero XP", (value) => {
    expect(getLevelProgress(value)).toMatchObject({ level: 1, totalXp: 0 })
  })

  it("has strictly increasing thresholds", () => {
    for (let i = 1; i < LEVELS.length; i += 1) {
      expect(LEVELS[i]!.minXp).toBeGreaterThan(LEVELS[i - 1]!.minXp)
    }
  })
})
