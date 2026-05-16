import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

const PLACEHOLDER_PATTERN = /^your_/i

/** True when real Supabase project URL and anon key are in .env */
export function isSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) return false
  if (PLACEHOLDER_PATTERN.test(supabaseUrl)) return false
  if (PLACEHOLDER_PATTERN.test(supabaseAnonKey)) return false
  if (!/^https?:\/\//i.test(supabaseUrl)) return false
  return true
}

if (!isSupabaseConfigured()) {
  console.warn(
    'Supabase: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (Project Settings → API in Supabase).',
  )
}

const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key',
)

export default supabase
