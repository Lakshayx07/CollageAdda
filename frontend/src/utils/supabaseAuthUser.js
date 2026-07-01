import { createSupabaseClientWithAccessToken } from "./supabase";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").trim();

let cachedAuth = null;

export const getAuthenticatedSupabaseClient = async () => {
  const appToken = localStorage.getItem("collegeadda_token");
  if (!appToken) {
    throw new Error("User is not authenticated");
  }

  if (cachedAuth?.appToken === appToken) return cachedAuth;

  const response = await fetch(`${API_URL}/api/auth/supabase-token`, {
    headers: { Authorization: `Bearer ${appToken}` },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Could not create Supabase session");
  }

  const client = createSupabaseClientWithAccessToken(data.accessToken);
  if (!client || !data.user?.id) {
    throw new Error("Supabase is not configured");
  }

  cachedAuth = {
    appToken,
    client,
    user: data.user,
  };

  return cachedAuth;
};
