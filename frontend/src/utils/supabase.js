import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (typeof window !== 'undefined') {
  console.log("Supabase URL present:", !!supabaseUrl);
  console.log("Supabase Key present:", !!supabaseAnonKey);
}

// Only initialize if keys are present to avoid DNS errors with placeholders
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
