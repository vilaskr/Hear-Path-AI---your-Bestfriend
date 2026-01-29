import { createClient } from '@supabase/supabase-js';

// Support both standard process.env (Vercel) and Vite's import.meta.env
const supabaseUrl = (typeof process !== 'undefined' ? process.env.SUPABASE_URL : null) || (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : null) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("HeartPath: Supabase credentials missing. The app is running in Local Storage mode.");
}