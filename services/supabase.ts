import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables across different build environments
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  // @ts-ignore
  if (import.meta.env && import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
  return null;
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("HeartPath: Supabase credentials missing or invalid. App is in Local Storage mode.");
}