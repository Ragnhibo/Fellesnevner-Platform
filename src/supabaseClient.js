import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If these aren't set (e.g. running locally without a .env file yet),
// the app still works — the leaderboard just won't load or save.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
