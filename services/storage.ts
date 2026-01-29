
import { AppState, Message, MoodLog, JournalEntry, User, ChatMode } from '../types';

/**
 * PRODUCTION NOTE:
 * In a real production environment, this file would interact with Supabase:
 * 
 * const { data, error } = await supabase.from('messages').insert([...])
 * 
 * SQL SCHEMA:
 * 
 * CREATE TABLE public.profiles (
 *   id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
 *   email text,
 *   full_name text
 * );
 * 
 * CREATE TABLE public.conversations (
 *   id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   user_id uuid REFERENCES auth.users NOT NULL,
 *   role text NOT NULL, -- 'user' or 'model'
 *   content text NOT NULL,
 *   mode text NOT NULL,
 *   created_at timestamp with time zone DEFAULT now()
 * );
 * 
 * CREATE TABLE public.mood_logs (
 *   id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   user_id uuid REFERENCES auth.users NOT NULL,
 *   score int NOT NULL,
 *   note text,
 *   created_at timestamp with time zone DEFAULT now()
 * );
 */

const STORAGE_KEY = 'heartpath_app_state';

export const storageService = {
  loadState: (): Partial<AppState> => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    try {
      return JSON.parse(saved);
    } catch (e) {
      return {};
    }
  },

  saveState: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
