import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase env vars are missing. Copy .env.example to .env and fill in ' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (also set these in your ' +
    'Vercel/Netlify project settings when deploying).'
  )
}

// createClient() throws synchronously if the URL/key are missing or malformed.
// Since this module gets imported at the top of the whole app, letting that
// throw here would crash React before it ever mounts - producing a blank
// white screen with no on-page explanation. Guarding it means App.jsx can
// check isSupabaseConfigured and show an actual error message instead.
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null

// The table this app syncs to. One row per (user, data-key) pair - see
// README.md for the SQL to create it, and useCloudState.js for how it's used.
export const TABLE = 'closet_organizer_state'
