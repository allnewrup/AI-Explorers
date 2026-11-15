/**
 * Column lists used by every `.select()` in the app.
 *
 * They live in one plain module (no server-only imports) so the database
 * contract test can run each list against the real schema as the
 * `authenticated` role. A typo, a renamed column or a column that role is not
 * allowed to read fails the test-suite instead of failing in production.
 */
export const COLUMNS = {
  profiles: "id, role, display_name",
  child_profiles:
    "id, display_name, avatar_key, age_band, show_on_leaderboard, is_active, created_at",
  parental_consents:
    "id, child_profile_id, consent_type, policy_version, consent_status, recorded_at, revoked_at",
  learning_worlds: "id, title, slug, description, image_key, age_band, display_order, is_active",
  lessons_summary:
    "id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes, display_order, is_sample, status, video_asset_key, updated_at",
  lessons_detail:
    "id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes, display_order, learning_objectives, video_asset_key, captions_asset_key, transcript, key_terms, key_takeaways, advantages, limitations, safety_notes, is_sample, status, published_at, updated_at",
  quizzes: "id, lesson_id, title, instructions, passing_score",
  // The answer key (quiz_options.is_correct) and quiz_questions.explanation are
  // deliberately absent: the API role cannot select them.
  quiz_questions: "id, quiz_id, question_text, question_type, difficulty, display_order",
  quiz_options: "id, question_id, option_text, display_order",
  lesson_progress:
    "lesson_id, video_completed, lesson_completed, started_at, completed_at, updated_at",
  quiz_attempts: "id, quiz_id, score, total_questions, correct_answers, started_at, completed_at",
  quiz_responses:
    "id, question_id, selected_option_id, is_correct, question_text, selected_option_text, correct_option_text, answered_at",
  points_ledger: "id, event_type, reference_id, points, created_at",
  achievements: "id, title, description, badge_key, points_threshold",
  child_achievements: "achievement_id, earned_at",
} as const

/** Which table each column list is selected from (used by the contract test). */
export const COLUMN_TABLES: Record<keyof typeof COLUMNS, string> = {
  profiles: "profiles",
  child_profiles: "child_profiles",
  parental_consents: "parental_consents",
  learning_worlds: "learning_worlds",
  lessons_summary: "lessons",
  lessons_detail: "lessons",
  quizzes: "quizzes",
  quiz_questions: "quiz_questions",
  quiz_options: "quiz_options",
  lesson_progress: "lesson_progress",
  quiz_attempts: "quiz_attempts",
  quiz_responses: "quiz_responses",
  points_ledger: "points_ledger",
  achievements: "achievements",
  child_achievements: "child_achievements",
}
