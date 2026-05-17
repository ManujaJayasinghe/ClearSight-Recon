/**
 * @param {unknown} error
 */
export function isSupabaseError(error) {
  const message = String(error?.message ?? error ?? '').toLowerCase()
  if (!message) return false
  return (
    /supabase/i.test(message) ||
    /postgrest/i.test(message) ||
    /criminal_reports/i.test(message) ||
    /schema cache/i.test(message) ||
    /jwt/i.test(message) ||
    /failed to load criminal reports/i.test(message)
  )
}
