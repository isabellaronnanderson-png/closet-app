import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn(
    'Supabase env vars are missing. Copy .env.example to .env and fill in ' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (also set these in your ' +
    'Vercel/Netlify project settings when deploying).'
  )
}

export const supabase = createClient(url, anonKey)

// The table this app syncs to. One row per (user, data-key) pair - see
// README.md for the SQL to create it, and useCloudState.js for how it's used.
export const TABLE = 'closet_organizer_state'
