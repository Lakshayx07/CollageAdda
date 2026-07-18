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
  // Use the highest value between Supabase (streak_count) and MongoDB (streak)
  // to ensure users don't lose their streak if databases are slightly out of sync.
  const raw = Math.max(profile?.streak_count || 0, profile?.streak || 0);
  const count = Number(raw);
  // Return 1 as minimum only when we have no data at all (null/undefined)
  if (raw === null || raw === undefined || !Number.isFinite(count) || count === 0) return 1;
  return count;
};
