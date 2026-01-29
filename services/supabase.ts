import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Safely get environment variables from process.env
const supabaseUrl = typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined;
const supabaseAnonKey = typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined;

// Export initialized client or null if config is missing
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.log("HeartPath: Supabase environment variables not found. Operating in local-first mode.");
}