import { MAX_CHILD_PROFILES } from "@/config/gamification"

/** Shape shared by PostgREST and Supabase Auth errors. */
export type BackendError = { code?: string | null; message?: string | null } | null | undefined

const GENERIC = "Something went wrong. Please try again."

const DOMAIN_MESSAGES: Record<string, string> = {
  "aie:not_authenticated": "Please sign in again.",
  "aie:profile_missing": "Your account is not fully set up yet. Please sign out and in again.",
  "aie:child_not_found": "We could not find that explorer profile.",
  "aie:child_inactive": "This explorer profile is paused. A parent can switch it back on.",
  "aie:child_limit_reached": `You can have up to ${MAX_CHILD_PROFILES} explorer profiles.`,
  "aie:invalid_display_name": "That explorer name is not allowed. Use 3–20 letters or numbers and keep it friendly.",
  "aie:policy_version_required": "Please review and accept the consent statements.",
  "aie:lesson_not_available": "That lesson is not available right now.",
  "aie:lesson_not_found": "That lesson could not be found.",
  "aie:quiz_not_available": "That quiz is not available right now.",
  "aie:quiz_incomplete": "Answer every question before finishing the quiz.",
  "aie:attempt_not_found": "We could not find that quiz attempt.",
  "aie:attempt_already_completed": "This quiz attempt is already finished.",
  "aie:question_not_in_quiz": "That question is not part of this quiz.",
  "aie:option_not_in_question": "That answer is not one of the choices.",
  "aie:question_has_no_answer_key": "This question is not ready yet. Please tell a grown-up.",
  "aie:challenge_not_available": "There is no daily challenge available right now.",
  "aie:admin_required": "Only administrators can do that.",
  "aie:invalid_payload": "The lesson could not be saved because the form data was incomplete.",
  "aie:question_needs_one_correct_option": "Every question needs exactly one correct answer.",
  "aie:question_needs_2_to_6_options": "Every question needs between two and six answer choices.",
  "aie:publish_blocked:world_inactive": "Activate the lesson's learning world before publishing.",
  "aie:publish_blocked:description_missing": "Add a description (at least 10 characters) before publishing.",
  "aie:publish_blocked:transcript_missing": "Add the lesson text or transcript (at least 50 characters) before publishing.",
  "aie:publish_blocked:objectives_missing": "Add at least one learning objective before publishing.",
  "aie:publish_blocked:safety_notes_missing": "Add at least one safety note before publishing.",
  "aie:publish_blocked:quiz_missing": "Add a quiz before publishing.",
  "aie:publish_blocked:questions_missing": "Add at least one quiz question before publishing.",
  "aie:publish_blocked:answer_key_incomplete":
    "Every question needs at least two choices and exactly one correct answer before publishing.",
}

/** Extracts the stable `aie:…` code raised by the database functions, if any. */
export function domainErrorCode(error: BackendError): string | null {
  const match = /aie:[a-z0-9_]+(?::[a-z0-9_]+)?/.exec(error?.message ?? "")
  return match ? match[0] : null
}

/** Turns a database error into a sentence that is safe to show to a user. */
export function describeDbError(error: BackendError, fallback: string = GENERIC): string {
  if (!error) return fallback

  const code = domainErrorCode(error)
  if (code) return DOMAIN_MESSAGES[code] ?? fallback

  switch (error.code) {
    case "23505":
      return "That value is already in use. Please choose a different one."
    case "23514":
    case "22P02":
    case "23502":
      return "Some of the details were not valid. Please check the form and try again."
    case "42501":
      return "You do not have permission to do that."
    default:
      return fallback
  }
}

/** Maps Supabase Auth errors to wording that does not leak account existence. */
export function describeAuthError(error: BackendError): string {
  const code = error?.code ?? ""
  const message = (error?.message ?? "").toLowerCase()

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "That email and password do not match. Please try again."
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Please confirm your email address first. Check your inbox for our message."
  }
  if (code === "weak_password" || message.includes("password should")) {
    return "Please choose a stronger password."
  }
  if (code === "same_password") {
    return "Please choose a password you have not used before."
  }
  if (code.includes("rate_limit") || message.includes("rate limit") || message.includes("too many")) {
    return "Too many attempts. Please wait a minute and try again."
  }
  if (code === "signup_disabled") {
    return "New sign-ups are switched off at the moment."
  }
  if (code === "otp_expired" || message.includes("expired")) {
    return "That link has expired. Please request a new one."
  }
  return GENERIC
}
