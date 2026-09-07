import { createClient } from "@supabase/supabase-js";

// Falls back to the provided project credentials if no env vars are set,
// so the app works out of the box. Override via .env for other environments.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dyjaqtmxrrapgcktvzxe.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_nQQnNBqLNvT4kEJ5BlHqAA_Jxygg4h8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table used to store this app's trips (and a single row for global style
// settings, keyed by a reserved id) — see supabase-schema.sql for the DDL.
export const TRIPS_TABLE = "postmark_trips";
export const STYLE_ROW_ID = "__postmark_style_settings__";
