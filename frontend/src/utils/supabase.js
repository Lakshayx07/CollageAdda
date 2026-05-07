import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in the browser.
 * This client automatically handles session persistence via cookies,
 * which allows the Next.js Middleware to verify the user on the server.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
