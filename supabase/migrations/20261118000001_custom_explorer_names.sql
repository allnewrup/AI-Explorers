-- =============================================================================
-- AI Explorers — 0005 parent-typed explorer names
-- =============================================================================
-- Parents may now type their own explorer name instead of only picking a
-- generated one. A name must be 3–20 letters or digits with single spaces
-- between words, contain at least one letter, and contain none of the blocked
-- words (case-insensitive, spaces ignored). Generated names such as
-- "CosmicOtter42" still pass.
--
-- Keep these rules and the blocked-word list identical to
-- src/config/explorer-names.ts. The list is inlined (not a helper function) so
-- no new function needs an execute grant.
--
-- `create or replace` keeps the existing grants, and the CHECK constraint on
-- child_profiles.display_name picks up the new definition. Existing rows are
-- generated names, which remain valid.

create or replace function app_private.is_valid_explorer_name(p_name text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_squashed text;
  v_word text;
begin
  if p_name is null then
    return false;
  end if;
  if char_length(p_name) < 3 or char_length(p_name) > 20 then
    return false;
  end if;
  if p_name !~ '^[A-Za-z0-9]+( [A-Za-z0-9]+)*$' or p_name !~ '[A-Za-z]' then
    return false;
  end if;
  v_squashed := lower(replace(p_name, ' ', ''));
  foreach v_word in array array[
    'bastard','bitch','cock','cunt','dick','fag','fuck','hitler','nazi','nigg',
    'penis','porn','pussy','rape','sex','shit','slut','twat','vagina','wank',
    'whore'
  ]::text[] loop
    if position(v_word in v_squashed) > 0 then
      return false;
    end if;
  end loop;
  return true;
end;
$$;
