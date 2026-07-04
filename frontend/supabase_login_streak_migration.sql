-- ============================================================
-- MIGRATION: Daily Login Streaks for Campus Adda profiles
-- Safe to re-run in Supabase SQL Editor.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_count INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_login_date DATE;

CREATE OR REPLACE FUNCTION public.handle_user_login_streak(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := current_date;
  v_last_login_date date;
  v_streak_count integer;
  v_days_diff integer;
  v_new_streak_count integer;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN 1;
  END IF;

  SELECT last_login_date, streak_count
    INTO v_last_login_date, v_streak_count
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 1;
  END IF;

  v_streak_count := COALESCE(v_streak_count, 1);

  IF v_last_login_date IS NULL THEN
    UPDATE public.profiles
    SET streak_count = 1,
        last_login_date = v_today
    WHERE id = p_user_id;

    RETURN 1;
  END IF;

  IF v_last_login_date = v_today THEN
    RETURN v_streak_count;
  END IF;

  v_days_diff := v_today - v_last_login_date;
  v_new_streak_count := v_streak_count;

  -- Always increment streak regardless of gap
  v_new_streak_count := v_streak_count + 1;

  UPDATE public.profiles
  SET streak_count = v_new_streak_count,
      last_login_date = v_today
  WHERE id = p_user_id;

  RETURN v_new_streak_count;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 1;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_user_login_streak(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_user_login_streak(uuid) TO authenticated;
