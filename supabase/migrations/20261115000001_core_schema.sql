-- =============================================================================
-- AI Explorers — 0001 core schema
-- -----------------------------------------------------------------------------
-- Tables, enums, constraints and indexes. No row-level security or grants are
-- defined here; they live in 0003 so the whole access model reads in one file.
--
-- Conventions
--   * UUID primary keys, timezone-aware timestamps.
--   * Children are never identified by real-world data: no name, no birth
--     date, no e-mail. A child is an age band, a generated explorer name and
--     an avatar key.
--   * `app_private` holds helpers that must not be reachable through the API.
-- =============================================================================

create schema if not exists app_private;

-- ---------------------------------------------------------------------------
-- Enumerations
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('parent', 'admin');
create type public.age_band as enum ('5-7', '8-12', '13-15');
create type public.lesson_status as enum ('draft', 'published', 'archived');
create type public.difficulty_level as enum ('beginner', 'intermediate', 'advanced');
create type public.question_type as enum ('multiple_choice');
create type public.consent_type as enum ('terms_and_privacy', 'child_profile_data', 'leaderboard_display');
create type public.consent_status as enum ('granted', 'revoked');
create type public.points_event_type as enum (
  'lesson_completed',
  'quiz_completed',
  'quiz_correct_answer',
  'daily_challenge'
);

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Explorer names are built from two fixed word lists plus a two-digit number,
-- e.g. "CosmicOtter42". Enforcing the lists here (not only in the app) means a
-- hand-crafted API request cannot store free text as a child's display name.
-- Keep these lists identical to src/config/explorer-names.ts.
create function app_private.explorer_adjectives()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array[
    'Brave','Bright','Clever','Cosmic','Curious','Daring','Gentle','Happy',
    'Jolly','Lucky','Lunar','Mighty','Nimble','Quantum','Solar','Sparkly',
    'Stellar','Sunny','Swift','Turbo','Witty','Zippy'
  ]::text[];
$$;

create function app_private.explorer_nouns()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array[
    'Badger','Comet','Dolphin','Dragon','Falcon','Fox','Gecko','Hawk',
    'Koala','Lynx','Otter','Owl','Panda','Penguin','Pilot','Planet',
    'Ranger','Robot','Rocket','Tiger','Turtle','Wizard'
  ]::text[];
$$;

create function app_private.is_valid_explorer_name(p_name text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_parts text[];
begin
  if p_name is null then
    return false;
  end if;
  v_parts := regexp_match(p_name, '^([A-Z][a-z]+)([A-Z][a-z]+)([0-9]{2})$');
  if v_parts is null then
    return false;
  end if;
  return v_parts[1] = any (app_private.explorer_adjectives())
     and v_parts[2] = any (app_private.explorer_nouns());
end;
$$;

-- key_terms must be an array of { "term": text, "definition": text } objects.
create function app_private.is_valid_key_terms(p_terms jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(p_terms) = 'array'
     and not exists (
       select 1
       from jsonb_array_elements(case when jsonb_typeof(p_terms) = 'array' then p_terms else '[]'::jsonb end) as t(item)
       where jsonb_typeof(t.item) <> 'object'
          or coalesce(char_length(btrim(t.item ->> 'term')), 0) not between 1 and 80
          or coalesce(char_length(btrim(t.item ->> 'definition')), 0) not between 1 and 400
     );
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles — one row per authenticated adult (parent or administrator)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'parent',
  display_name text not null check (char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Adult accounts. role is assigned by the database only; it is never client-writable.';

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function app_private.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. child_profiles — owned and managed by a parent
-- ---------------------------------------------------------------------------
create table public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null check (app_private.is_valid_explorer_name(display_name)),
  avatar_key text not null check (avatar_key ~ '^[a-z][a-z0-9-]{0,39}$'),
  age_band public.age_band not null,
  show_on_leaderboard boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.child_profiles is
  'Child learner profiles. Deliberately holds no real name, birth date or contact detail.';

create index child_profiles_parent_id_idx on public.child_profiles (parent_id);

create trigger child_profiles_set_updated_at
before update on public.child_profiles
for each row execute function app_private.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. parental_consents — evidence of what a signed-in adult agreed to
-- ---------------------------------------------------------------------------
create table public.parental_consents (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  child_profile_id uuid not null references public.child_profiles (id) on delete cascade,
  consent_type public.consent_type not null,
  policy_version text not null check (char_length(policy_version) between 1 and 40),
  consent_status public.consent_status not null default 'granted',
  recorded_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint parental_consents_revocation_consistent
    check ((consent_status = 'revoked') = (revoked_at is not null))
);

comment on table public.parental_consents is
  'Records that a signed-in adult ticked a consent statement. This is evidence only and is NOT verifiable parental consent.';

create index parental_consents_parent_id_idx on public.parental_consents (parent_id);
create index parental_consents_child_profile_id_idx on public.parental_consents (child_profile_id);

-- ---------------------------------------------------------------------------
-- 4. learning_worlds — top-level curriculum categories
-- ---------------------------------------------------------------------------
create table public.learning_worlds (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  description text not null default '' check (char_length(description) <= 500),
  image_key text not null check (image_key ~ '^[a-z][a-z0-9-]{0,59}$'),
  age_band public.age_band not null default '8-12',
  display_order integer not null default 0 check (display_order between 0 and 10000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger learning_worlds_set_updated_at
before update on public.learning_worlds
for each row execute function app_private.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. lessons
-- ---------------------------------------------------------------------------
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  learning_world_id uuid not null references public.learning_worlds (id) on delete restrict,
  title text not null check (char_length(title) between 3 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  description text not null default '' check (char_length(description) <= 600),
  age_band public.age_band not null default '8-12',
  difficulty public.difficulty_level not null default 'beginner',
  estimated_minutes integer not null default 8 check (estimated_minutes between 1 and 120),
  display_order integer not null default 0 check (display_order between 0 and 10000),
  learning_objectives text[] not null default '{}',
  -- Storage object path in the private "lesson-media" bucket. NULL means no
  -- video has been uploaded; the app then shows a "media pending" state.
  video_asset_key text check (video_asset_key is null or char_length(video_asset_key) between 1 and 300),
  captions_asset_key text check (captions_asset_key is null or char_length(captions_asset_key) between 1 and 300),
  transcript text not null default '' check (char_length(transcript) <= 20000),
  -- [{ "term": "...", "definition": "..." }]
  key_terms jsonb not null default '[]'::jsonb check (app_private.is_valid_key_terms(key_terms)),
  key_takeaways text[] not null default '{}',
  advantages text[] not null default '{}',
  limitations text[] not null default '{}',
  safety_notes text[] not null default '{}',
  -- Marks original demonstration content that ships with the seed.
  is_sample boolean not null default false,
  status public.lesson_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_published_has_timestamp
    check (status <> 'published' or published_at is not null),
  constraint lessons_captions_need_video
    check (captions_asset_key is null or video_asset_key is not null)
);

create index lessons_world_order_idx on public.lessons (learning_world_id, display_order);
create index lessons_status_idx on public.lessons (status);

create trigger lessons_set_updated_at
before update on public.lessons
for each row execute function app_private.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. quizzes — exactly one quiz per lesson
-- ---------------------------------------------------------------------------
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  instructions text not null default '' check (char_length(instructions) <= 600),
  passing_score integer not null default 60 check (passing_score between 0 and 100),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 7. quiz_questions
-- ---------------------------------------------------------------------------
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question_text text not null check (char_length(question_text) between 5 and 400),
  question_type public.question_type not null default 'multiple_choice',
  difficulty public.difficulty_level not null default 'beginner',
  -- Shown only after the child has answered. Never selectable by API roles.
  explanation text not null default '' check (char_length(explanation) <= 600),
  display_order integer not null default 0 check (display_order between 0 and 1000)
);

create index quiz_questions_quiz_order_idx on public.quiz_questions (quiz_id, display_order);

-- ---------------------------------------------------------------------------
-- 8. quiz_options
-- ---------------------------------------------------------------------------
create table public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  option_text text not null check (char_length(option_text) between 1 and 240),
  -- The answer key. Never selectable by API roles (see 0003).
  is_correct boolean not null default false,
  display_order integer not null default 0 check (display_order between 0 and 100)
);

create index quiz_options_question_order_idx on public.quiz_options (question_id, display_order);
-- At most one correct option per question.
create unique index quiz_options_single_correct_idx on public.quiz_options (question_id) where is_correct;

-- ---------------------------------------------------------------------------
-- 16. content_versions — immutable snapshots of a lesson and its quiz
-- (declared before quiz_attempts, which references it)
-- ---------------------------------------------------------------------------
create table public.content_versions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  version_number integer not null check (version_number > 0),
  content_snapshot jsonb not null check (jsonb_typeof(content_snapshot) = 'object'),
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (lesson_id, version_number)
);

create index content_versions_changed_by_idx on public.content_versions (changed_by);

-- ---------------------------------------------------------------------------
-- 9. lesson_progress
-- ---------------------------------------------------------------------------
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles (id) on delete cascade,
  -- RESTRICT: a lesson with learner history is archived, not deleted.
  lesson_id uuid not null references public.lessons (id) on delete restrict,
  video_completed boolean not null default false,
  lesson_completed boolean not null default false,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (child_profile_id, lesson_id),
  constraint lesson_progress_completion_consistent
    check (lesson_completed = (completed_at is not null))
);

create index lesson_progress_lesson_id_idx on public.lesson_progress (lesson_id);

create trigger lesson_progress_set_updated_at
before update on public.lesson_progress
for each row execute function app_private.set_updated_at();

-- ---------------------------------------------------------------------------
-- 10. quiz_attempts
-- ---------------------------------------------------------------------------
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles (id) on delete cascade,
  quiz_id uuid not null references public.quizzes (id) on delete restrict,
  -- The lesson version the child actually saw.
  content_version_id uuid references public.content_versions (id) on delete set null,
  -- Percentage, 0–100. Meaningful once completed_at is set.
  score integer not null default 0 check (score between 0 and 100),
  total_questions integer not null check (total_questions between 1 and 100),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint quiz_attempts_correct_within_total check (correct_answers <= total_questions)
);

create index quiz_attempts_child_completed_idx on public.quiz_attempts (child_profile_id, completed_at desc);
create index quiz_attempts_quiz_id_idx on public.quiz_attempts (quiz_id);
create index quiz_attempts_content_version_id_idx on public.quiz_attempts (content_version_id);
-- A child has at most one unfinished attempt per quiz. This is what makes
-- "start quiz" idempotent under double-clicks and retries.
create unique index quiz_attempts_single_open_idx
  on public.quiz_attempts (child_profile_id, quiz_id)
  where completed_at is null;

-- ---------------------------------------------------------------------------
-- 11. quiz_responses
-- ---------------------------------------------------------------------------
create table public.quiz_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts (id) on delete cascade,
  -- SET NULL + text snapshots: editing or removing a question later must not
  -- erase what the child was actually asked and what they answered.
  question_id uuid references public.quiz_questions (id) on delete set null,
  selected_option_id uuid references public.quiz_options (id) on delete set null,
  is_correct boolean not null,
  question_text text not null,
  selected_option_text text not null,
  correct_option_text text not null,
  answered_at timestamptz not null default now(),
  -- One answer per question per attempt: the first answer is final.
  unique (attempt_id, question_id)
);

create index quiz_responses_question_id_idx on public.quiz_responses (question_id);
create index quiz_responses_selected_option_id_idx on public.quiz_responses (selected_option_id);

-- ---------------------------------------------------------------------------
-- 12. points_ledger — append-only XP transactions
-- ---------------------------------------------------------------------------
create table public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles (id) on delete cascade,
  event_type public.points_event_type not null,
  -- What the points were earned for: a lesson, quiz, question or daily
  -- challenge completion id, depending on event_type.
  reference_id uuid not null,
  points integer not null check (points between 1 and 1000),
  created_at timestamptz not null default now(),
  -- The duplicate-reward guard: one reward per child, per event, per thing.
  unique (child_profile_id, event_type, reference_id)
);

comment on table public.points_ledger is
  'Append-only XP ledger. Total XP is always SUM(points). Rows are written only by SECURITY DEFINER functions.';

create index points_ledger_child_created_idx on public.points_ledger (child_profile_id, created_at desc);
create index points_ledger_created_at_idx on public.points_ledger (created_at);

-- ---------------------------------------------------------------------------
-- 13. achievements
-- ---------------------------------------------------------------------------
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 80),
  description text not null default '' check (char_length(description) <= 300),
  badge_key text not null unique check (badge_key ~ '^[a-z][a-z0-9-]{0,39}$'),
  points_threshold integer not null check (points_threshold between 0 and 1000000),
  is_active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- 14. child_achievements
-- ---------------------------------------------------------------------------
create table public.child_achievements (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (child_profile_id, achievement_id)
);

create index child_achievements_achievement_id_idx on public.child_achievements (achievement_id);

-- ---------------------------------------------------------------------------
-- 15. learning_streaks
-- ---------------------------------------------------------------------------
create table public.learning_streaks (
  child_profile_id uuid primary key references public.child_profiles (id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  -- Calendar date in UTC. Per-family time zones are a later phase.
  last_learning_date date,
  constraint learning_streaks_longest_covers_current check (longest_streak >= current_streak)
);

-- ---------------------------------------------------------------------------
-- Addition: daily_challenge_completions — one "question of the day" per child
-- ---------------------------------------------------------------------------
create table public.daily_challenge_completions (
  id uuid not null unique default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles (id) on delete cascade,
  challenge_date date not null,
  question_id uuid references public.quiz_questions (id) on delete set null,
  selected_option_id uuid references public.quiz_options (id) on delete set null,
  is_correct boolean not null,
  completed_at timestamptz not null default now(),
  primary key (child_profile_id, challenge_date)
);

create index daily_challenge_completions_question_id_idx on public.daily_challenge_completions (question_id);
create index daily_challenge_completions_selected_option_id_idx on public.daily_challenge_completions (selected_option_id);
