import { describe, expect, it } from "vitest"
import {
  pickContinueLesson,
  pickNextLesson,
  progressStateOf,
  summariseWorldProgress,
  type PathLesson,
  type ProgressState,
} from "@/features/lessons/learning-path"

function lesson(id: string, worldId: string, progress: ProgressState, lastActivityAt: string | null = null): PathLesson {
  return {
    id,
    slug: id,
    title: id,
    description: "",
    estimatedMinutes: 8,
    isSample: true,
    hasVideo: false,
    worldId,
    worldTitle: worldId,
    worldSlug: worldId,
    worldImageKey: "world-beginners",
    progress,
    lastActivityAt,
  }
}

describe("progressStateOf", () => {
  it("maps stored progress to a state", () => {
    expect(progressStateOf(null)).toBe("not_started")
    expect(progressStateOf(undefined)).toBe("not_started")
    expect(progressStateOf({ lesson_completed: false })).toBe("in_progress")
    expect(progressStateOf({ lesson_completed: true })).toBe("completed")
  })
})

describe("pickNextLesson (today's lesson)", () => {
  it("is the first unfinished lesson in curriculum order", () => {
    const path = [lesson("a", "w1", "completed"), lesson("b", "w1", "in_progress"), lesson("c", "w2", "not_started")]
    expect(pickNextLesson(path)?.id).toBe("b")
  })

  it("is null when everything is complete or nothing is published", () => {
    expect(pickNextLesson([lesson("a", "w1", "completed")])).toBeNull()
    expect(pickNextLesson([])).toBeNull()
  })
})

describe("pickContinueLesson", () => {
  it("is the most recently opened unfinished lesson", () => {
    const path = [
      lesson("a", "w1", "not_started"),
      lesson("b", "w1", "in_progress", "2026-11-10T10:00:00Z"),
      lesson("c", "w2", "in_progress", "2026-11-12T10:00:00Z"),
    ]
    expect(pickContinueLesson(path, path[0]!)?.id).toBe("c")
  })

  it("is not shown when it would repeat today's lesson", () => {
    const path = [lesson("a", "w1", "in_progress", "2026-11-12T10:00:00Z"), lesson("b", "w1", "not_started")]
    expect(pickContinueLesson(path, pickNextLesson(path))).toBeNull()
  })

  it("is null when nothing is in progress", () => {
    const path = [lesson("a", "w1", "completed"), lesson("b", "w1", "not_started")]
    expect(pickContinueLesson(path, pickNextLesson(path))).toBeNull()
  })
})

describe("summariseWorldProgress", () => {
  it("counts lessons and completions per world", () => {
    const summary = summariseWorldProgress([
      lesson("a", "w1", "completed"),
      lesson("b", "w1", "in_progress"),
      lesson("c", "w2", "completed"),
    ])
    expect(summary.get("w1")).toEqual({ worldId: "w1", completed: 1, total: 2 })
    expect(summary.get("w2")).toEqual({ worldId: "w2", completed: 1, total: 1 })
    expect(summary.get("w3")).toBeUndefined()
  })
})
