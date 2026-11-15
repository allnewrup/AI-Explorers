-- =============================================================================
-- AI Explorers — 0003 row-level security and grants
-- -----------------------------------------------------------------------------
-- The access model, in one place.
--
-- Roles (Supabase)
--   anon           – not signed in
--   authenticated  – a signed-in parent or administrator (children never have
--                    their own login; they learn inside the parent's session)
--   service_role   – trusted server/CLI use only; bypasses RLS. The web app
--                    never uses it at runtime.
--
-- Strategy
--   1. Start from zero: revoke everything API roles may have been granted by
--      default, then grant back the minimum, column by column where needed.
--   2. Enable RLS on every table. A table with RLS enabled and no policy is
--      readable by nobody through the API.
--   3. Learner data is READ through policies and WRITTEN only by the
--      SECURITY DEFINER functions in 0002. There is no INSERT/UPDATE/DELETE
--      grant on progress, attempts, responses, streaks, achievements or the
--      points ledger, so XP cannot be edited from a browser at all.
--   4. Content is written only by the admin_* functions. Admin status comes
--      from profiles.role, which API roles cannot modify.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Reset privileges
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

revoke all on schema app_private from public, anon, authenticated;
revoke all on all tables in schema app_private from public, anon, authenticated;
revoke all on all functions in schema app_private from public, anon, authenticated;

-- Objects created by later migrations start locked down too. Each new table or
-- function must be granted deliberately.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema app_private revoke execute on functions from public, anon, authenticated;

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- RLS policies call these two predicates as the querying role.
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_admin() to authenticated;
grant execute on function app_private.owns_child(uuid) to authenticated;

-- CHECK constraints run with the privileges of whoever performs the write, so
-- a parent editing their own child needs to be able to run the display-name
-- validator. These three are pure functions over a public word list.
grant execute on function app_private.is_valid_explorer_name(text) to authenticated;
grant execute on function app_private.explorer_adjectives() to authenticated;
grant execute on function app_private.explorer_nouns() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Enable RLS everywhere
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.child_profiles enable row level security;
alter table public.parental_consents enable row level security;
alter table public.learning_worlds enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.content_versions enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_responses enable row level security;
alter table public.points_ledger enable row level security;
alter table public.achievements enable row level security;
alter table public.child_achievements enable row level security;
alter table public.learning_streaks enable row level security;
alter table public.daily_challenge_completions enable row level security;

-- ---------------------------------------------------------------------------
-- 3. profiles
--    Rule 1: a parent can access only their own profile.
--    Rule 11: role is never client-editable (only display_name is granted).
-- ---------------------------------------------------------------------------
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. child_profiles and parental_consents
--    Rule 2: parents reach only children linked to their own account.
--    Rule 10: parents cannot touch another parent's records.
--    Creation goes through create_child_profile() so consent is always
--    recorded; show_on_leaderboard goes through set_leaderboard_visibility().
--    Administrators get no access to child profiles at all.
-- ---------------------------------------------------------------------------
grant select on public.child_profiles to authenticated;
grant update (display_name, avatar_key, age_band, is_active) on public.child_profiles to authenticated;
grant delete on public.child_profiles to authenticated;

create policy "child_profiles: parent reads own children" on public.child_profiles
  for select to authenticated
  using (parent_id = (select auth.uid()));

create policy "child_profiles: parent updates own children" on public.child_profiles
  for update to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));

create policy "child_profiles: parent deletes own children" on public.child_profiles
  for delete to authenticated
  using (parent_id = (select auth.uid()));

grant select on public.parental_consents to authenticated;

create policy "parental_consents: parent reads own records" on public.parental_consents
  for select to authenticated
  using (parent_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 5. Curriculum content
--    Rule 5: published content is readable by signed-in users (world titles
--            are also public, for the marketing page).
--    Rule 6: drafts and archived lessons are invisible to ordinary users.
--    Rule 7: only administrators create, update or publish content.
-- ---------------------------------------------------------------------------
grant select on public.learning_worlds to anon, authenticated;
grant insert, update on public.learning_worlds to authenticated;

create policy "learning_worlds: anyone reads active worlds" on public.learning_worlds
  for select to anon
  using (is_active);

create policy "learning_worlds: signed-in users read active worlds, admins read all" on public.learning_worlds
  for select to authenticated
  using (is_active or (select app_private.is_admin()));

create policy "learning_worlds: admins insert" on public.learning_worlds
  for insert to authenticated
  with check ((select app_private.is_admin()));

create policy "learning_worlds: admins update" on public.learning_worlds
  for update to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

-- Lessons: read-only through the API. All writes go through admin_* functions.
grant select on public.lessons to authenticated;

create policy "lessons: published lessons in active worlds, admins read all" on public.lessons
  for select to authenticated
  using (
    (select app_private.is_admin())
    or (
      status = 'published'
      and exists (
        select 1 from public.learning_worlds w
        where w.id = lessons.learning_world_id and w.is_active
      )
    )
  );

grant select on public.quizzes to authenticated;

-- The sub-select on lessons is itself filtered by the lessons policy, so a
-- quiz is visible only when its lesson is.
create policy "quizzes: visible with a visible lesson" on public.quizzes
  for select to authenticated
  using (
    (select app_private.is_admin())
    or (
      is_published
      and exists (select 1 from public.lessons l where l.id = quizzes.lesson_id)
    )
  );

-- Column-level grants keep the answer key and explanations out of reach:
--   quiz_questions.explanation and quiz_options.is_correct are NOT granted,
--   so `select *` and any attempt to read those columns fails for every API
--   user, administrators included. Admins read them via admin_get_lesson().
grant select (id, quiz_id, question_text, question_type, difficulty, display_order)
  on public.quiz_questions to authenticated;

create policy "quiz_questions: visible with a visible quiz" on public.quiz_questions
  for select to authenticated
  using (exists (select 1 from public.quizzes q where q.id = quiz_questions.quiz_id));

grant select (id, question_id, option_text, display_order)
  on public.quiz_options to authenticated;

create policy "quiz_options: visible with a visible question" on public.quiz_options
  for select to authenticated
  using (exists (select 1 from public.quiz_questions qq where qq.id = quiz_options.question_id));

-- content_versions: RLS enabled, no policy, no grant. Reached only through
-- admin_get_lesson().

grant select on public.achievements to authenticated;

create policy "achievements: signed-in users read active achievements" on public.achievements
  for select to authenticated
  using (is_active or (select app_private.is_admin()));

-- ---------------------------------------------------------------------------
-- 6. Learner records
--    Rule 3: parents read the progress and quiz history of their children.
--    Rule 4: nobody else can read a child's records.
--    Rules 8 & 9: no write grants at all. Only the 0002 functions write here.
-- ---------------------------------------------------------------------------
grant select on public.lesson_progress to authenticated;
create policy "lesson_progress: parent reads own children" on public.lesson_progress
  for select to authenticated
  using ((select app_private.owns_child(child_profile_id)));

grant select on public.quiz_attempts to authenticated;
create policy "quiz_attempts: parent reads own children" on public.quiz_attempts
  for select to authenticated
  using ((select app_private.owns_child(child_profile_id)));

grant select on public.quiz_responses to authenticated;
create policy "quiz_responses: visible with a visible attempt" on public.quiz_responses
  for select to authenticated
  using (exists (select 1 from public.quiz_attempts a where a.id = quiz_responses.attempt_id));

grant select on public.points_ledger to authenticated;
create policy "points_ledger: parent reads own children" on public.points_ledger
  for select to authenticated
  using ((select app_private.owns_child(child_profile_id)));

grant select on public.child_achievements to authenticated;
create policy "child_achievements: parent reads own children" on public.child_achievements
  for select to authenticated
  using ((select app_private.owns_child(child_profile_id)));

grant select on public.learning_streaks to authenticated;
create policy "learning_streaks: parent reads own children" on public.learning_streaks
  for select to authenticated
  using ((select app_private.owns_child(child_profile_id)));

grant select on public.daily_challenge_completions to authenticated;
create policy "daily_challenge_completions: parent reads own children" on public.daily_challenge_completions
  for select to authenticated
  using ((select app_private.owns_child(child_profile_id)));

-- ---------------------------------------------------------------------------
-- 7. Function grants — the public API. Nothing is granted to anon.
-- ---------------------------------------------------------------------------
grant execute on function public.create_child_profile(text, text, public.age_band, boolean, text) to authenticated;
grant execute on function public.set_leaderboard_visibility(uuid, boolean, text) to authenticated;
grant execute on function public.record_lesson_progress(uuid, uuid, boolean) to authenticated;
grant execute on function public.complete_lesson(uuid, uuid) to authenticated;
grant execute on function public.start_quiz_attempt(uuid, uuid) to authenticated;
grant execute on function public.answer_quiz_question(uuid, uuid, uuid) to authenticated;
grant execute on function public.complete_quiz_attempt(uuid) to authenticated;
grant execute on function public.get_daily_challenge(uuid) to authenticated;
grant execute on function public.submit_daily_challenge(uuid, uuid) to authenticated;
grant execute on function public.get_child_summary(uuid) to authenticated;
grant execute on function public.get_weekly_leaderboard(uuid, integer) to authenticated;
-- The admin functions are executable by any signed-in user at the SQL level,
-- and each one immediately rejects callers who are not administrators.
grant execute on function public.admin_get_lesson(uuid) to authenticated;
grant execute on function public.admin_upsert_lesson(uuid, jsonb) to authenticated;
grant execute on function public.admin_set_lesson_status(uuid, public.lesson_status) to authenticated;
grant execute on function public.admin_content_overview() to authenticated;
