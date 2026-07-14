import { getAuthenticatedSupabaseClient } from "./supabaseAuthUser";

export const LOGIN_STREAK_UPDATED_EVENT = "collegeadda:login-streak-updated";

export const mergeStreakIntoStoredUser = (streakCount) => {
  const count = Number(streakCount);
  if (!Number.isFinite(count) || count < 1) return null;

  const stored = localStorage.getItem("collegeadda_user");
  if (!stored) return count;

  try {
    const user = JSON.parse(stored);
    const updatedUser = {
      ...user,
      // Always overwrite both fields with the authoritative value from Supabase
      streak_count: count,
      streak: count,
    };
    localStorage.setItem("collegeadda_user", JSON.stringify(updatedUser));
    window.dispatchEvent(new CustomEvent(LOGIN_STREAK_UPDATED_EVENT, {
      detail: { streak_count: count },
    }));
  } catch (error) {
    console.error("Could not merge login streak into cached user:", error);
  }

  return count;
};

export const syncLoginStreakForUser = async (userId) => {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const { client } = await getAuthenticatedSupabaseClient();
    const { data, error } = await client.rpc("handle_user_login_streak", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Login streak RPC failed:", error);
      return null;
    }

    return mergeStreakIntoStoredUser(data);
  } catch (error) {
    console.error("Could not sync login streak:", error);
    return null;
  }
};

export const getDisplayStreak = (profile) => {
  // Prefer streak_count (from Supabase, most authoritative) then fall back to streak (from MongoDB)
  const raw = profile?.streak_count ?? profile?.streak;
  const count = Number(raw);
  // Return 1 as minimum only when we have no data at all (null/undefined)
  if (raw === null || raw === undefined || !Number.isFinite(count)) return 1;
  return Math.max(1, count);
};
