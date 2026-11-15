import type { Enums } from "@/types/database"

export const XP_EVENT_LABELS: Record<Enums<"points_event_type">, string> = {
  lesson_completed: "Finished a lesson",
  quiz_completed: "Completed a quiz",
  quiz_correct_answer: "Correct quiz answer",
  daily_challenge: "Daily challenge",
}
