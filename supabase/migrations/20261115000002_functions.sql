-- =============================================================================
-- AI Explorers — 0002 functions
-- -----------------------------------------------------------------------------
-- Everything that changes learner data or awards points lives here, inside the
-- database, so that the browser is never the authority.
--
-- Rules followed by every function in this file
--   * SECURITY DEFINER functions pin `search_path = ''` and schema-qualify
--     every object, so they cannot be hijacked through the search path.
--   * Functions in `public` are the API surface. Each one authorises the
--     caller itself (auth.uid() ownership or admin check) before doing work.
--   * Functions in `app_private` are internal. Execute is revoked from API
--     roles in 0003, except the two predicates used by RLS policies.
--   * Domain errors are raised with messages prefixed `aie:` which the app
--     maps to friendly text. Authorisation failures use SQLSTATE 42501.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- XP rules. Mirrored for display in src/config/gamification.ts.
-- ---------------------------------------------------------------------------
create function app_private.xp_for(p_event public.points_event_type)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case p_event
    when 'lesson_completed' then 10
    when 'quiz_completed' then 5
    when 'quiz_correct_answer' then 10
    when 'daily_challenge' then 15
  end;
$$;

create function app_private.max_child_profiles()
returns integer
language sql
immutable
set search_path = ''
as $$ select 6; $$;

-- ---------------------------------------------------------------------------
-- Authorisation predicates (used by RLS policies in 0003)
-- ---------------------------------------------------------------------------
create function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

create function app_private.owns_child(p_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.child_profiles c
    where c.id = p_child_id
      and c.parent_id = (select auth.uid())
  );
$$;

-- Returns the child row if (and only if) the caller is its parent.
-- A child that does not exist and a child that belongs to someone else are
-- deliberately indistinguishable.
create function app_private.require_owned_child(p_child_id uuid)
returns public.child_profiles
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_child public.child_profiles;
begin
  select c.* into v_child
  from public.child_profiles c
  where c.id = p_child_id
    and c.parent_id = (select auth.uid());

  if not found then
    raise exception 'aie:child_not_found' using errcode = '42501';
  end if;
  return v_child;
end;
$$;

-- As above, and the profile must not be paused by the parent.
create function app_private.require_active_child(p_child_id uuid)
returns public.child_profiles
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_child public.child_profiles;
begin
  v_child := app_private.require_owned_child(p_child_id);
  if not v_child.is_active then
    raise exception 'aie:child_inactive';
  end if;
  return v_child;
end;
$$;

create function app_private.require_admin()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not app_private.is_admin() then
    raise exception 'aie:admin_required' using errcode = '42501';
  end if;
  return (select auth.uid());
end;
$$;

-- ---------------------------------------------------------------------------
-- Account lifecycle
-- ---------------------------------------------------------------------------

-- Creates the profile row for every new auth user. The role is hard-coded:
-- whatever a client puts in sign-up metadata, a new account is a parent.
create function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'parent',
    coalesce(nullif(left(btrim(new.raw_user_meta_data ->> 'display_name'), 60), ''), 'Parent')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function app_private.handle_new_user();

-- Second line of defence behind the column grants in 0003: even if a future
-- migration accidentally grants UPDATE on profiles.role, API roles still
-- cannot change it. Only the database owner / service role can (that is how
-- an administrator is appointed — see scripts/grant-admin.mjs).
create function app_private.guard_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and current_user in ('anon', 'authenticated') then
    raise exception 'aie:role_change_not_permitted' using errcode = '42501';
  end if;
  if new.id is distinct from old.id then
    raise exception 'aie:profile_id_immutable' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
before update on public.profiles
for each row execute function app_private.guard_profile_role();

-- A child can never be moved to a different parent.
create function app_private.guard_child_parent()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is distinct from old.parent_id then
    raise exception 'aie:child_parent_immutable' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger child_profiles_guard_parent
before update on public.child_profiles
for each row execute function app_private.guard_child_parent();

-- ---------------------------------------------------------------------------
-- Gamification internals
-- ---------------------------------------------------------------------------

-- The only code path that writes to points_ledger. Returns the points that
-- were actually awarded: 0 when this reward had already been given.
create function app_private.award_points(
  p_child_id uuid,
  p_event public.points_event_type,
  p_reference_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_points integer := app_private.xp_for(p_event);
  v_rows integer;
begin
  insert into public.points_ledger (child_profile_id, event_type, reference_id, points)
  values (p_child_id, p_event, p_reference_id, v_points)
  on conflict (child_profile_id, event_type, reference_id) do nothing;

  get diagnostics v_rows = row_count;
  return case when v_rows > 0 then v_points else 0 end;
end;
$$;

create function app_private.total_xp(p_child_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(l.points), 0)::integer
  from public.points_ledger l
  where l.child_profile_id = p_child_id;
$$;

create function app_private.utc_today()
returns date
language sql
stable
set search_path = ''
as $$ select (now() at time zone 'utc')::date; $$;

create function app_private.utc_week_start()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select date_trunc('week', now() at time zone 'utc') at time zone 'utc'; $$;

create function app_private.touch_streak(p_child_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := app_private.utc_today();
begin
  insert into public.learning_streaks as s (child_profile_id, current_streak, longest_streak, last_learning_date)
  values (p_child_id, 1, 1, v_today)
  on conflict (child_profile_id) do update
  set current_streak = case
        when s.last_learning_date = v_today then s.current_streak
        when s.last_learning_date = v_today - 1 then s.current_streak + 1
        else 1
      end,
      longest_streak = greatest(
        s.longest_streak,
        case
          when s.last_learning_date = v_today then s.current_streak
          when s.last_learning_date = v_today - 1 then s.current_streak + 1
          else 1
        end
      ),
      last_learning_date = v_today;
end;
$$;

-- Grants every active achievement whose threshold the child has reached and
-- returns the ones that are new.
create function app_private.award_achievements(p_child_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer := app_private.total_xp(p_child_id);
  v_new jsonb;
begin
  with inserted as (
    insert into public.child_achievements (child_profile_id, achievement_id)
    select p_child_id, a.id
    from public.achievements a
    where a.is_active
      and a.points_threshold <= v_total
    on conflict (child_profile_id, achievement_id) do nothing
    returning achievement_id
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'title', a.title,
        'description', a.description,
        'badge_key', a.badge_key
      )
      order by a.points_threshold
    ),
    '[]'::jsonb
  )
  into v_new
  from inserted i
  join public.achievements a on a.id = i.achievement_id;

  return v_new;
end;
$$;

-- Called after anything that counts as "learning today".
create function app_private.after_learning_event(p_child_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.touch_streak(p_child_id);
  return app_private.award_achievements(p_child_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Content internals
-- ---------------------------------------------------------------------------
create function app_private.lesson_is_available(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.lessons l
    join public.learning_worlds w on w.id = l.learning_world_id
    where l.id = p_lesson_id
      and l.status = 'published'
      and w.is_active
  );
$$;

create function app_private.jsonb_text_array(p_value jsonb)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    array(
      select btrim(e.item)
      from jsonb_array_elements_text(
        case when jsonb_typeof(p_value) = 'array' then p_value else '[]'::jsonb end
      ) with ordinality as e(item, position)
      where btrim(e.item) <> ''
      order by e.position
    ),
    '{}'::text[]
  );
$$;

-- The complete lesson document: lesson, quiz, questions and options including
-- the answer key. Internal; used for snapshots and the admin editor.
create function app_private.lesson_document(p_lesson_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select to_jsonb(l) || jsonb_build_object(
    'quiz',
    (
      select to_jsonb(q) || jsonb_build_object(
        'questions',
        coalesce(
          (
            select jsonb_agg(
              to_jsonb(qq) || jsonb_build_object(
                'options',
                coalesce(
                  (
                    select jsonb_agg(to_jsonb(o) order by o.display_order, o.id)
                    from public.quiz_options o
                    where o.question_id = qq.id
                  ),
                  '[]'::jsonb
                )
              )
              order by qq.display_order, qq.id
            )
            from public.quiz_questions qq
            where qq.quiz_id = q.id
          ),
          '[]'::jsonb
        )
      )
      from public.quizzes q
      where q.lesson_id = l.id
    )
  )
  from public.lessons l
  where l.id = p_lesson_id;
$$;

-- Stores an immutable snapshot of the lesson as it is right now.
create function app_private.snapshot_lesson(p_lesson_id uuid, p_changed_by uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version integer;
  v_id uuid;
begin
  -- Lock the lesson so concurrent saves cannot produce the same version number.
  perform 1 from public.lessons l where l.id = p_lesson_id for update;
  if not found then
    raise exception 'aie:lesson_not_found';
  end if;

  select coalesce(max(v.version_number), 0) + 1
  into v_version
  from public.content_versions v
  where v.lesson_id = p_lesson_id;

  insert into public.content_versions (lesson_id, version_number, content_snapshot, changed_by)
  values (p_lesson_id, v_version, app_private.lesson_document(p_lesson_id), p_changed_by)
  returning id into v_id;

  return v_id;
end;
$$;

-- Raises if the lesson is not complete enough to show to children.
create function app_private.assert_publishable(p_lesson_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_lesson public.lessons;
  v_quiz_id uuid;
  v_question_count integer;
  v_bad_questions integer;
begin
  select l.* into v_lesson from public.lessons l where l.id = p_lesson_id;
  if not found then
    raise exception 'aie:lesson_not_found';
  end if;

  if not exists (
    select 1 from public.learning_worlds w
    where w.id = v_lesson.learning_world_id and w.is_active
  ) then
    raise exception 'aie:publish_blocked:world_inactive';
  end if;
  if char_length(btrim(v_lesson.description)) < 10 then
    raise exception 'aie:publish_blocked:description_missing';
  end if;
  if char_length(btrim(v_lesson.transcript)) < 50 then
    raise exception 'aie:publish_blocked:transcript_missing';
  end if;
  if coalesce(array_length(v_lesson.learning_objectives, 1), 0) < 1 then
    raise exception 'aie:publish_blocked:objectives_missing';
  end if;
  if coalesce(array_length(v_lesson.safety_notes, 1), 0) < 1 then
    raise exception 'aie:publish_blocked:safety_notes_missing';
  end if;

  select q.id into v_quiz_id from public.quizzes q where q.lesson_id = p_lesson_id;
  if v_quiz_id is null then
    raise exception 'aie:publish_blocked:quiz_missing';
  end if;

  select count(*) into v_question_count
  from public.quiz_questions qq
  where qq.quiz_id = v_quiz_id;
  if v_question_count < 1 then
    raise exception 'aie:publish_blocked:questions_missing';
  end if;

  select count(*) into v_bad_questions
  from public.quiz_questions qq
  where qq.quiz_id = v_quiz_id
    and (
      (select count(*) from public.quiz_options o where o.question_id = qq.id) < 2
      or (select count(*) from public.quiz_options o where o.question_id = qq.id and o.is_correct) <> 1
    );
  if v_bad_questions > 0 then
    raise exception 'aie:publish_blocked:answer_key_incomplete';
  end if;
end;
$$;

-- ===========================================================================
-- PUBLIC API — parents
-- ===========================================================================

-- Creates a child profile and its consent records in one transaction, so a
-- child profile can never exist without a recorded consent.
create function public.create_child_profile(
  p_display_name text,
  p_avatar_key text,
  p_age_band public.age_band,
  p_show_on_leaderboard boolean,
  p_policy_version text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent uuid := (select auth.uid());
  v_child_id uuid;
  v_count integer;
begin
  if v_parent is null then
    raise exception 'aie:not_authenticated' using errcode = '42501';
  end if;

  -- Lock the parent row so two concurrent requests cannot both pass the cap.
  perform 1 from public.profiles p where p.id = v_parent for update;
  if not found then
    raise exception 'aie:profile_missing' using errcode = '42501';
  end if;

  if not app_private.is_valid_explorer_name(p_display_name) then
    raise exception 'aie:invalid_display_name';
  end if;
  if p_policy_version is null or btrim(p_policy_version) = '' then
    raise exception 'aie:policy_version_required';
  end if;

  select count(*) into v_count
  from public.child_profiles c
  where c.parent_id = v_parent;
  if v_count >= app_private.max_child_profiles() then
    raise exception 'aie:child_limit_reached';
  end if;

  insert into public.child_profiles (parent_id, display_name, avatar_key, age_band, show_on_leaderboard)
  values (v_parent, p_display_name, p_avatar_key, p_age_band, coalesce(p_show_on_leaderboard, false))
  returning id into v_child_id;

  insert into public.parental_consents (parent_id, child_profile_id, consent_type, policy_version)
  values
    (v_parent, v_child_id, 'terms_and_privacy', btrim(p_policy_version)),
    (v_parent, v_child_id, 'child_profile_data', btrim(p_policy_version));

  if coalesce(p_show_on_leaderboard, false) then
    insert into public.parental_consents (parent_id, child_profile_id, consent_type, policy_version)
    values (v_parent, v_child_id, 'leaderboard_display', btrim(p_policy_version));
  end if;

  return v_child_id;
end;
$$;

-- Turning leaderboard visibility on or off always leaves a consent record.
create function public.set_leaderboard_visibility(
  p_child_id uuid,
  p_visible boolean,
  p_policy_version text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_child public.child_profiles;
begin
  v_child := app_private.require_owned_child(p_child_id);

  if coalesce(p_visible, false) = v_child.show_on_leaderboard then
    return;
  end if;

  if coalesce(p_visible, false) then
    if p_policy_version is null or btrim(p_policy_version) = '' then
      raise exception 'aie:policy_version_required';
    end if;
    insert into public.parental_consents (parent_id, child_profile_id, consent_type, policy_version)
    values (v_child.parent_id, v_child.id, 'leaderboard_display', btrim(p_policy_version));
  else
    update public.parental_consents pc
    set consent_status = 'revoked',
        revoked_at = now()
    where pc.child_profile_id = v_child.id
      and pc.consent_type = 'leaderboard_display'
      and pc.consent_status = 'granted';
  end if;

  update public.child_profiles c
  set show_on_leaderboard = coalesce(p_visible, false)
  where c.id = v_child.id;
end;
$$;

-- ===========================================================================
-- PUBLIC API — learning
-- ===========================================================================

-- Records that a child opened a lesson (and, optionally, finished its video).
create function public.record_lesson_progress(
  p_child_id uuid,
  p_lesson_id uuid,
  p_video_completed boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_active_child(p_child_id);
  if not app_private.lesson_is_available(p_lesson_id) then
    raise exception 'aie:lesson_not_available';
  end if;

  insert into public.lesson_progress as lp (child_profile_id, lesson_id, video_completed)
  values (p_child_id, p_lesson_id, coalesce(p_video_completed, false))
  on conflict (child_profile_id, lesson_id) do update
  set video_completed = lp.video_completed or excluded.video_completed;
end;
$$;

-- Marks a lesson complete and awards the lesson XP exactly once.
create function public.complete_lesson(p_child_id uuid, p_lesson_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_awarded integer;
  v_new_achievements jsonb;
begin
  perform app_private.require_active_child(p_child_id);
  if not app_private.lesson_is_available(p_lesson_id) then
    raise exception 'aie:lesson_not_available';
  end if;

  insert into public.lesson_progress as lp (child_profile_id, lesson_id, lesson_completed, completed_at)
  values (p_child_id, p_lesson_id, true, now())
  on conflict (child_profile_id, lesson_id) do update
  set lesson_completed = true,
      completed_at = coalesce(lp.completed_at, now());

  v_awarded := app_private.award_points(p_child_id, 'lesson_completed', p_lesson_id);
  v_new_achievements := app_private.after_learning_event(p_child_id);

  return jsonb_build_object(
    'points_awarded', v_awarded,
    'already_completed', v_awarded = 0,
    'total_xp', app_private.total_xp(p_child_id),
    'new_achievements', v_new_achievements
  );
end;
$$;

-- Starts a quiz attempt, or returns the unfinished one so a child can resume.
create function public.start_quiz_attempt(p_child_id uuid, p_quiz_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lesson_id uuid;
  v_attempt_id uuid;
  v_question_count integer;
  v_version_id uuid;
begin
  perform app_private.require_active_child(p_child_id);

  select q.lesson_id into v_lesson_id
  from public.quizzes q
  where q.id = p_quiz_id
    and q.is_published;
  if v_lesson_id is null or not app_private.lesson_is_available(v_lesson_id) then
    raise exception 'aie:quiz_not_available';
  end if;

  select a.id into v_attempt_id
  from public.quiz_attempts a
  where a.child_profile_id = p_child_id
    and a.quiz_id = p_quiz_id
    and a.completed_at is null;

  if v_attempt_id is null then
    select count(*) into v_question_count
    from public.quiz_questions qq
    where qq.quiz_id = p_quiz_id;
    if v_question_count < 1 then
      raise exception 'aie:quiz_not_available';
    end if;

    select v.id into v_version_id
    from public.content_versions v
    where v.lesson_id = v_lesson_id
    order by v.version_number desc
    limit 1;

    begin
      insert into public.quiz_attempts (child_profile_id, quiz_id, content_version_id, total_questions)
      values (p_child_id, p_quiz_id, v_version_id, v_question_count)
      returning id into v_attempt_id;
    exception when unique_violation then
      -- A concurrent request created the open attempt first; use that one.
      select a.id into v_attempt_id
      from public.quiz_attempts a
      where a.child_profile_id = p_child_id
        and a.quiz_id = p_quiz_id
        and a.completed_at is null;
    end;
  end if;

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'answered',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'question_id', r.question_id,
            'selected_option_id', r.selected_option_id,
            'is_correct', r.is_correct,
            'correct_option_id', (
              select o.id from public.quiz_options o
              where o.question_id = r.question_id and o.is_correct
            ),
            'explanation', coalesce(
              (select qq.explanation from public.quiz_questions qq where qq.id = r.question_id),
              ''
            )
          )
          order by r.answered_at
        )
        from public.quiz_responses r
        where r.attempt_id = v_attempt_id
          and r.question_id is not null
      ),
      '[]'::jsonb
    )
  );
end;
$$;

-- Judges one answer. The first answer to a question is final; sending another
-- returns the original verdict. Correctness never comes from the client.
create function public.answer_quiz_question(
  p_attempt_id uuid,
  p_question_id uuid,
  p_option_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.quiz_attempts;
  v_question public.quiz_questions;
  v_option public.quiz_options;
  v_correct public.quiz_options;
  v_existing public.quiz_responses;
  v_already boolean := false;
begin
  select a.* into v_attempt
  from public.quiz_attempts a
  where a.id = p_attempt_id
  for update;

  if not found or not app_private.owns_child(v_attempt.child_profile_id) then
    raise exception 'aie:attempt_not_found' using errcode = '42501';
  end if;
  perform app_private.require_active_child(v_attempt.child_profile_id);

  if v_attempt.completed_at is not null then
    raise exception 'aie:attempt_already_completed';
  end if;

  select qq.* into v_question
  from public.quiz_questions qq
  where qq.id = p_question_id
    and qq.quiz_id = v_attempt.quiz_id;
  if not found then
    raise exception 'aie:question_not_in_quiz';
  end if;

  select o.* into v_correct
  from public.quiz_options o
  where o.question_id = p_question_id
    and o.is_correct;
  if not found then
    raise exception 'aie:question_has_no_answer_key';
  end if;

  select r.* into v_existing
  from public.quiz_responses r
  where r.attempt_id = p_attempt_id
    and r.question_id = p_question_id;

  if found then
    v_already := true;
  else
    select o.* into v_option
    from public.quiz_options o
    where o.id = p_option_id
      and o.question_id = p_question_id;
    if not found then
      raise exception 'aie:option_not_in_question';
    end if;

    insert into public.quiz_responses (
      attempt_id, question_id, selected_option_id, is_correct,
      question_text, selected_option_text, correct_option_text
    )
    values (
      p_attempt_id, p_question_id, v_option.id, v_option.is_correct,
      v_question.question_text, v_option.option_text, v_correct.option_text
    )
    returning * into v_existing;
  end if;

  return jsonb_build_object(
    'question_id', p_question_id,
    'selected_option_id', v_existing.selected_option_id,
    'is_correct', v_existing.is_correct,
    'correct_option_id', v_correct.id,
    'explanation', v_question.explanation,
    'already_answered', v_already
  );
end;
$$;

-- Scores the attempt and awards quiz XP. Safe to call repeatedly: a second
-- call returns the stored result and awards nothing.
create function public.complete_quiz_attempt(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.quiz_attempts;
  v_quiz public.quizzes;
  v_unanswered integer;
  v_total integer;
  v_correct integer;
  v_score integer;
  v_points integer := 0;
  v_new_achievements jsonb := '[]'::jsonb;
  v_already boolean := false;
  v_question_id uuid;
begin
  select a.* into v_attempt
  from public.quiz_attempts a
  where a.id = p_attempt_id
  for update;

  if not found or not app_private.owns_child(v_attempt.child_profile_id) then
    raise exception 'aie:attempt_not_found' using errcode = '42501';
  end if;

  select q.* into v_quiz from public.quizzes q where q.id = v_attempt.quiz_id;

  if v_attempt.completed_at is not null then
    v_already := true;
  else
    perform app_private.require_active_child(v_attempt.child_profile_id);

    select count(*) into v_unanswered
    from public.quiz_questions qq
    where qq.quiz_id = v_attempt.quiz_id
      and not exists (
        select 1 from public.quiz_responses r
        where r.attempt_id = p_attempt_id and r.question_id = qq.id
      );
    if v_unanswered > 0 then
      raise exception 'aie:quiz_incomplete';
    end if;

    select count(*), count(*) filter (where r.is_correct)
    into v_total, v_correct
    from public.quiz_responses r
    where r.attempt_id = p_attempt_id;
    if v_total < 1 then
      raise exception 'aie:quiz_incomplete';
    end if;

    v_score := round(100.0 * v_correct / v_total)::integer;

    update public.quiz_attempts a
    set score = v_score,
        total_questions = v_total,
        correct_answers = v_correct,
        completed_at = now()
    where a.id = p_attempt_id
    returning * into v_attempt;

    -- Participation reward: once per quiz, however many times it is retaken.
    v_points := v_points
      + app_private.award_points(v_attempt.child_profile_id, 'quiz_completed', v_attempt.quiz_id);

    -- Correct-answer reward: once per question, so retaking a quiz lets a
    -- child earn the points they missed but never the same points twice.
    for v_question_id in
      select r.question_id
      from public.quiz_responses r
      where r.attempt_id = p_attempt_id
        and r.is_correct
        and r.question_id is not null
    loop
      v_points := v_points
        + app_private.award_points(v_attempt.child_profile_id, 'quiz_correct_answer', v_question_id);
    end loop;

    v_new_achievements := app_private.after_learning_event(v_attempt.child_profile_id);
  end if;

  return jsonb_build_object(
    'attempt_id', v_attempt.id,
    'score', v_attempt.score,
    'total_questions', v_attempt.total_questions,
    'correct_answers', v_attempt.correct_answers,
    'passing_score', v_quiz.passing_score,
    'passed', v_attempt.score >= v_quiz.passing_score,
    'points_awarded', v_points,
    'total_xp', app_private.total_xp(v_attempt.child_profile_id),
    'new_achievements', v_new_achievements,
    'already_completed', v_already
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Daily challenge: one question a day, the same for every child in an age band
-- ---------------------------------------------------------------------------
create function app_private.daily_question_id(p_age_band public.age_band, p_date date)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select qq.id
  from public.quiz_questions qq
  join public.quizzes q on q.id = qq.quiz_id and q.is_published
  join public.lessons l on l.id = q.lesson_id and l.status = 'published'
  join public.learning_worlds w on w.id = l.learning_world_id and w.is_active
  where exists (
    select 1 from public.quiz_options o
    where o.question_id = qq.id and o.is_correct
  )
  order by (l.age_band = p_age_band) desc, md5(qq.id::text || p_date::text)
  limit 1;
$$;

create function app_private.daily_challenge_payload(
  p_child_id uuid,
  p_question_id uuid,
  p_completion public.daily_challenge_completions
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'challenge_date', app_private.utc_today(),
    'xp_reward', app_private.xp_for('daily_challenge'),
    'available', p_question_id is not null or p_completion.child_profile_id is not null,
    'completed', p_completion.child_profile_id is not null,
    'question',
    (
      select jsonb_build_object(
        'id', qq.id,
        'question_text', qq.question_text,
        'lesson_title', l.title,
        'lesson_slug', l.slug,
        'options',
        (
          select jsonb_agg(
            jsonb_build_object('id', o.id, 'option_text', o.option_text)
            order by o.display_order, o.id
          )
          from public.quiz_options o
          where o.question_id = qq.id
        )
      )
      from public.quiz_questions qq
      join public.quizzes q on q.id = qq.quiz_id
      join public.lessons l on l.id = q.lesson_id
      where qq.id = p_question_id
    ),
    'result',
    case
      when p_completion.child_profile_id is null then null
      else jsonb_build_object(
        'selected_option_id', p_completion.selected_option_id,
        'is_correct', p_completion.is_correct,
        'correct_option_id', (
          select o.id from public.quiz_options o
          where o.question_id = p_question_id and o.is_correct
        ),
        'explanation', coalesce(
          (select qq.explanation from public.quiz_questions qq where qq.id = p_question_id),
          ''
        )
      )
    end
  );
$$;

create function public.get_daily_challenge(p_child_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_child public.child_profiles;
  v_completion public.daily_challenge_completions;
  v_question_id uuid;
begin
  v_child := app_private.require_active_child(p_child_id);

  select d.* into v_completion
  from public.daily_challenge_completions d
  where d.child_profile_id = p_child_id
    and d.challenge_date = app_private.utc_today();

  if found then
    v_question_id := v_completion.question_id;
  else
    v_question_id := app_private.daily_question_id(v_child.age_band, app_private.utc_today());
  end if;

  return app_private.daily_challenge_payload(p_child_id, v_question_id, v_completion);
end;
$$;

create function public.submit_daily_challenge(p_child_id uuid, p_option_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_child public.child_profiles;
  v_today date := app_private.utc_today();
  v_completion public.daily_challenge_completions;
  v_question_id uuid;
  v_option public.quiz_options;
  v_points integer := 0;
  v_new_achievements jsonb := '[]'::jsonb;
  v_already boolean := false;
begin
  v_child := app_private.require_active_child(p_child_id);

  select d.* into v_completion
  from public.daily_challenge_completions d
  where d.child_profile_id = p_child_id
    and d.challenge_date = v_today;

  if found then
    v_already := true;
    v_question_id := v_completion.question_id;
  else
    v_question_id := app_private.daily_question_id(v_child.age_band, v_today);
    if v_question_id is null then
      raise exception 'aie:challenge_not_available';
    end if;

    select o.* into v_option
    from public.quiz_options o
    where o.id = p_option_id
      and o.question_id = v_question_id;
    if not found then
      raise exception 'aie:option_not_in_question';
    end if;

    insert into public.daily_challenge_completions (
      child_profile_id, challenge_date, question_id, selected_option_id, is_correct
    )
    values (p_child_id, v_today, v_question_id, v_option.id, v_option.is_correct)
    on conflict (child_profile_id, challenge_date) do nothing
    returning * into v_completion;

    if v_completion.child_profile_id is null then
      -- Lost a race with a concurrent submission: report that one instead.
      v_already := true;
      select d.* into v_completion
      from public.daily_challenge_completions d
      where d.child_profile_id = p_child_id
        and d.challenge_date = v_today;
      v_question_id := v_completion.question_id;
    else
      v_points := app_private.award_points(p_child_id, 'daily_challenge', v_completion.id);
      v_new_achievements := app_private.after_learning_event(p_child_id);
    end if;
  end if;

  return app_private.daily_challenge_payload(p_child_id, v_question_id, v_completion)
    || jsonb_build_object(
      'points_awarded', v_points,
      'total_xp', app_private.total_xp(p_child_id),
      'new_achievements', v_new_achievements,
      'already_completed', v_already
    );
end;
$$;

-- ===========================================================================
-- PUBLIC API — read models
-- ===========================================================================

-- Headline numbers for one child. Readable by that child's parent only.
create function public.get_child_summary(p_child_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_week_start timestamptz := app_private.utc_week_start();
  v_today date := app_private.utc_today();
  v_answered integer;
  v_correct integer;
  v_streak public.learning_streaks;
begin
  perform app_private.require_owned_child(p_child_id);

  select coalesce(sum(a.total_questions), 0)::integer, coalesce(sum(a.correct_answers), 0)::integer
  into v_answered, v_correct
  from public.quiz_attempts a
  where a.child_profile_id = p_child_id
    and a.completed_at is not null;

  select s.* into v_streak
  from public.learning_streaks s
  where s.child_profile_id = p_child_id;

  return jsonb_build_object(
    'total_xp', app_private.total_xp(p_child_id),
    'weekly_xp', (
      select coalesce(sum(l.points), 0)::integer
      from public.points_ledger l
      where l.child_profile_id = p_child_id and l.created_at >= v_week_start
    ),
    'lessons_started', (
      select count(*)::integer from public.lesson_progress lp
      where lp.child_profile_id = p_child_id
    ),
    'lessons_completed', (
      select count(*)::integer from public.lesson_progress lp
      where lp.child_profile_id = p_child_id and lp.lesson_completed
    ),
    'weekly_lessons_completed', (
      select count(*)::integer from public.lesson_progress lp
      where lp.child_profile_id = p_child_id and lp.completed_at >= v_week_start
    ),
    'quiz_attempts', (
      select count(*)::integer from public.quiz_attempts a
      where a.child_profile_id = p_child_id and a.completed_at is not null
    ),
    'weekly_quiz_attempts', (
      select count(*)::integer from public.quiz_attempts a
      where a.child_profile_id = p_child_id and a.completed_at >= v_week_start
    ),
    'quizzes_passed', (
      select count(distinct a.quiz_id)::integer
      from public.quiz_attempts a
      join public.quizzes q on q.id = a.quiz_id
      where a.child_profile_id = p_child_id
        and a.completed_at is not null
        and a.score >= q.passing_score
    ),
    'questions_answered', v_answered,
    'correct_answers', v_correct,
    'accuracy_percent',
      case when v_answered > 0 then round(100.0 * v_correct / v_answered)::integer else null end,
    -- A streak only counts while it is alive: learned today or yesterday.
    'current_streak',
      case
        when v_streak.last_learning_date is not null and v_streak.last_learning_date >= v_today - 1
          then v_streak.current_streak
        else 0
      end,
    'longest_streak', coalesce(v_streak.longest_streak, 0),
    'last_learning_date', v_streak.last_learning_date,
    'achievements_earned', (
      select count(*)::integer from public.child_achievements ca
      where ca.child_profile_id = p_child_id
    )
  );
end;
$$;

-- Weekly leaderboard for the caller's child's age band.
-- Privacy: only children whose parent opted in appear to other families, and
-- only an explorer name, avatar key and weekly XP are returned. No ids.
create function public.get_weekly_leaderboard(p_child_id uuid, p_limit integer default 10)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_child public.child_profiles;
  v_week_start timestamptz := app_private.utc_week_start();
  v_limit integer := least(greatest(coalesce(p_limit, 10), 1), 50);
  v_result jsonb;
begin
  v_child := app_private.require_owned_child(p_child_id);

  with weekly as (
    select c.id, c.display_name, c.avatar_key, sum(l.points)::integer as weekly_xp
    from public.child_profiles c
    join public.points_ledger l
      on l.child_profile_id = c.id
     and l.created_at >= v_week_start
    where c.is_active
      and c.age_band = v_child.age_band
      and (c.show_on_leaderboard or c.id = p_child_id)
    group by c.id, c.display_name, c.avatar_key
  ),
  ranked as (
    select
      w.display_name,
      w.avatar_key,
      w.weekly_xp,
      (w.id = p_child_id) as is_self,
      rank() over (order by w.weekly_xp desc) as position,
      row_number() over (order by w.weekly_xp desc, w.display_name, w.id) as row_no
    from weekly w
  )
  select jsonb_build_object(
    'week_start', v_week_start::date,
    'entries', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'rank', r.position,
            'display_name', r.display_name,
            'avatar_key', r.avatar_key,
            'weekly_xp', r.weekly_xp,
            'is_self', r.is_self
          )
          order by r.row_no
        )
        from ranked r
        where r.row_no <= v_limit
      ),
      '[]'::jsonb
    ),
    'self', jsonb_build_object(
      'rank', (select r.position from ranked r where r.is_self),
      'weekly_xp', coalesce((select r.weekly_xp from ranked r where r.is_self), 0),
      'visible_to_others', v_child.show_on_leaderboard,
      'display_name', v_child.display_name,
      'avatar_key', v_child.avatar_key
    )
  )
  into v_result;

  return v_result;
end;
$$;

-- ===========================================================================
-- PUBLIC API — administrators
-- ===========================================================================

-- Full lesson document for the editor and preview, including the answer key.
create function public.admin_get_lesson(p_lesson_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_document jsonb;
begin
  perform app_private.require_admin();

  v_document := app_private.lesson_document(p_lesson_id);
  if v_document is null then
    raise exception 'aie:lesson_not_found';
  end if;

  return v_document || jsonb_build_object(
    'versions',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'version_number', v.version_number,
            'created_at', v.created_at,
            'changed_by_name', p.display_name,
            'status', v.content_snapshot ->> 'status'
          )
          order by v.version_number desc
        )
        from public.content_versions v
        left join public.profiles p on p.id = v.changed_by
        where v.lesson_id = p_lesson_id
      ),
      '[]'::jsonb
    )
  );
end;
$$;

-- Creates or updates a lesson together with its quiz, then stores a version
-- snapshot. Question and option ids are kept stable across edits so learner
-- history and "already rewarded" records stay attached to the right question.
create function public.admin_upsert_lesson(p_lesson_id uuid, p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid;
  v_lesson_id uuid := p_lesson_id;
  v_status public.lesson_status;
  v_quiz jsonb;
  v_quiz_id uuid;
  v_question jsonb;
  v_option jsonb;
  v_question_id uuid;
  v_option_id uuid;
  v_keep_questions uuid[] := '{}';
  v_keep_options uuid[];
  v_question_index integer := 0;
  v_option_index integer;
  v_option_count integer;
  v_correct_count integer;
begin
  v_admin := app_private.require_admin();

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'aie:invalid_payload';
  end if;

  if v_lesson_id is null then
    insert into public.lessons (
      learning_world_id, title, slug, description, age_band, difficulty,
      estimated_minutes, display_order, learning_objectives, video_asset_key,
      captions_asset_key, transcript, key_terms, key_takeaways, advantages,
      limitations, safety_notes, is_sample
    )
    values (
      (p_payload ->> 'learning_world_id')::uuid,
      btrim(p_payload ->> 'title'),
      btrim(p_payload ->> 'slug'),
      coalesce(btrim(p_payload ->> 'description'), ''),
      coalesce((p_payload ->> 'age_band')::public.age_band, '8-12'),
      coalesce((p_payload ->> 'difficulty')::public.difficulty_level, 'beginner'),
      coalesce((p_payload ->> 'estimated_minutes')::integer, 8),
      coalesce((p_payload ->> 'display_order')::integer, 0),
      app_private.jsonb_text_array(p_payload -> 'learning_objectives'),
      nullif(btrim(p_payload ->> 'video_asset_key'), ''),
      nullif(btrim(p_payload ->> 'captions_asset_key'), ''),
      coalesce(p_payload ->> 'transcript', ''),
      coalesce(p_payload -> 'key_terms', '[]'::jsonb),
      app_private.jsonb_text_array(p_payload -> 'key_takeaways'),
      app_private.jsonb_text_array(p_payload -> 'advantages'),
      app_private.jsonb_text_array(p_payload -> 'limitations'),
      app_private.jsonb_text_array(p_payload -> 'safety_notes'),
      coalesce((p_payload ->> 'is_sample')::boolean, false)
    )
    returning id, status into v_lesson_id, v_status;
  else
    update public.lessons l
    set learning_world_id = (p_payload ->> 'learning_world_id')::uuid,
        title = btrim(p_payload ->> 'title'),
        slug = btrim(p_payload ->> 'slug'),
        description = coalesce(btrim(p_payload ->> 'description'), ''),
        age_band = coalesce((p_payload ->> 'age_band')::public.age_band, l.age_band),
        difficulty = coalesce((p_payload ->> 'difficulty')::public.difficulty_level, l.difficulty),
        estimated_minutes = coalesce((p_payload ->> 'estimated_minutes')::integer, l.estimated_minutes),
        display_order = coalesce((p_payload ->> 'display_order')::integer, l.display_order),
        learning_objectives = app_private.jsonb_text_array(p_payload -> 'learning_objectives'),
        video_asset_key = nullif(btrim(p_payload ->> 'video_asset_key'), ''),
        captions_asset_key = nullif(btrim(p_payload ->> 'captions_asset_key'), ''),
        transcript = coalesce(p_payload ->> 'transcript', ''),
        key_terms = coalesce(p_payload -> 'key_terms', '[]'::jsonb),
        key_takeaways = app_private.jsonb_text_array(p_payload -> 'key_takeaways'),
        advantages = app_private.jsonb_text_array(p_payload -> 'advantages'),
        limitations = app_private.jsonb_text_array(p_payload -> 'limitations'),
        safety_notes = app_private.jsonb_text_array(p_payload -> 'safety_notes'),
        is_sample = coalesce((p_payload ->> 'is_sample')::boolean, l.is_sample)
    where l.id = v_lesson_id
    returning l.status into v_status;

    if not found then
      raise exception 'aie:lesson_not_found';
    end if;
  end if;

  v_quiz := p_payload -> 'quiz';
  if v_quiz is not null and jsonb_typeof(v_quiz) = 'object' then
    insert into public.quizzes as q (lesson_id, title, instructions, passing_score, is_published)
    values (
      v_lesson_id,
      coalesce(nullif(btrim(v_quiz ->> 'title'), ''), 'Lesson quiz'),
      coalesce(btrim(v_quiz ->> 'instructions'), ''),
      coalesce((v_quiz ->> 'passing_score')::integer, 60),
      v_status = 'published'
    )
    on conflict (lesson_id) do update
    set title = excluded.title,
        instructions = excluded.instructions,
        passing_score = excluded.passing_score
    returning q.id into v_quiz_id;

    for v_question in
      select e.item
      from jsonb_array_elements(
        case when jsonb_typeof(v_quiz -> 'questions') = 'array' then v_quiz -> 'questions' else '[]'::jsonb end
      ) with ordinality as e(item, position)
      order by e.position
    loop
      v_question_index := v_question_index + 1;

      select count(*), count(*) filter (where coalesce((o.item ->> 'is_correct')::boolean, false))
      into v_option_count, v_correct_count
      from jsonb_array_elements(
        case when jsonb_typeof(v_question -> 'options') = 'array' then v_question -> 'options' else '[]'::jsonb end
      ) as o(item);

      if v_option_count < 2 or v_option_count > 6 then
        raise exception 'aie:question_needs_2_to_6_options';
      end if;
      if v_correct_count <> 1 then
        raise exception 'aie:question_needs_one_correct_option';
      end if;

      v_question_id := nullif(v_question ->> 'id', '')::uuid;
      if v_question_id is not null then
        update public.quiz_questions qq
        set question_text = btrim(v_question ->> 'question_text'),
            difficulty = coalesce((v_question ->> 'difficulty')::public.difficulty_level, qq.difficulty),
            explanation = coalesce(btrim(v_question ->> 'explanation'), ''),
            display_order = v_question_index
        where qq.id = v_question_id
          and qq.quiz_id = v_quiz_id;
        if not found then
          raise exception 'aie:question_not_in_quiz';
        end if;
      else
        insert into public.quiz_questions (quiz_id, question_text, difficulty, explanation, display_order)
        values (
          v_quiz_id,
          btrim(v_question ->> 'question_text'),
          coalesce((v_question ->> 'difficulty')::public.difficulty_level, 'beginner'),
          coalesce(btrim(v_question ->> 'explanation'), ''),
          v_question_index
        )
        returning id into v_question_id;
      end if;
      v_keep_questions := v_keep_questions || v_question_id;

      -- Clear the answer key first so moving the correct flag from one option
      -- to another never trips the single-correct unique index mid-update.
      update public.quiz_options o set is_correct = false where o.question_id = v_question_id;

      v_keep_options := '{}';
      v_option_index := 0;
      for v_option in
        select e.item
        from jsonb_array_elements(v_question -> 'options') with ordinality as e(item, position)
        order by e.position
      loop
        v_option_index := v_option_index + 1;
        v_option_id := nullif(v_option ->> 'id', '')::uuid;

        if v_option_id is not null then
          update public.quiz_options o
          set option_text = btrim(v_option ->> 'option_text'),
              is_correct = coalesce((v_option ->> 'is_correct')::boolean, false),
              display_order = v_option_index
          where o.id = v_option_id
            and o.question_id = v_question_id;
          if not found then
            raise exception 'aie:option_not_in_question';
          end if;
        else
          insert into public.quiz_options (question_id, option_text, is_correct, display_order)
          values (
            v_question_id,
            btrim(v_option ->> 'option_text'),
            coalesce((v_option ->> 'is_correct')::boolean, false),
            v_option_index
          )
          returning id into v_option_id;
        end if;
        v_keep_options := v_keep_options || v_option_id;
      end loop;

      delete from public.quiz_options o
      where o.question_id = v_question_id
        and o.id <> all (v_keep_options);
    end loop;

    delete from public.quiz_questions qq
    where qq.quiz_id = v_quiz_id
      and qq.id <> all (v_keep_questions);
  end if;

  -- A lesson that is already live must stay valid after every save.
  if v_status = 'published' then
    perform app_private.assert_publishable(v_lesson_id);
  end if;

  perform app_private.snapshot_lesson(v_lesson_id, v_admin);
  return v_lesson_id;
end;
$$;

-- Moves a lesson between draft, published and archived.
create function public.admin_set_lesson_status(p_lesson_id uuid, p_status public.lesson_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid;
begin
  v_admin := app_private.require_admin();

  perform 1 from public.lessons l where l.id = p_lesson_id for update;
  if not found then
    raise exception 'aie:lesson_not_found';
  end if;

  if p_status = 'published' then
    perform app_private.assert_publishable(p_lesson_id);
  end if;

  update public.lessons l
  set status = p_status,
      published_at = case
        when p_status = 'published' then coalesce(l.published_at, now())
        else l.published_at
      end
  where l.id = p_lesson_id;

  -- The quiz is visible exactly when its lesson is.
  update public.quizzes q
  set is_published = (p_status = 'published')
  where q.lesson_id = p_lesson_id;

  perform app_private.snapshot_lesson(p_lesson_id, v_admin);
end;
$$;

-- Counts for the admin overview. Aggregate numbers only: no learner rows.
create function public.admin_content_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform app_private.require_admin();

  return jsonb_build_object(
    'worlds_total', (select count(*)::integer from public.learning_worlds),
    'worlds_active', (select count(*)::integer from public.learning_worlds w where w.is_active),
    'lessons_total', (select count(*)::integer from public.lessons),
    'lessons_published', (select count(*)::integer from public.lessons l where l.status = 'published'),
    'lessons_draft', (select count(*)::integer from public.lessons l where l.status = 'draft'),
    'lessons_archived', (select count(*)::integer from public.lessons l where l.status = 'archived'),
    'lessons_sample', (select count(*)::integer from public.lessons l where l.is_sample),
    'lessons_without_video', (
      select count(*)::integer from public.lessons l
      where l.status = 'published' and l.video_asset_key is null
    ),
    'quizzes_total', (select count(*)::integer from public.quizzes),
    'questions_total', (select count(*)::integer from public.quiz_questions),
    'families_total', (select count(*)::integer from public.profiles p where p.role = 'parent'),
    'child_profiles_total', (select count(*)::integer from public.child_profiles),
    'lessons_completed_total', (
      select count(*)::integer from public.lesson_progress lp where lp.lesson_completed
    ),
    'quiz_attempts_total', (
      select count(*)::integer from public.quiz_attempts a where a.completed_at is not null
    )
  );
end;
$$;
