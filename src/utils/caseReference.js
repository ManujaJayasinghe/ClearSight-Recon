/**
 * @returns {string} e.g. CASE-2026-4821
 */
export function generateCaseReference() {
  const year = new Date().getFullYear()
  const suffix = String(Math.floor(1000 + Math.random() * 9000))
  return `CASE-${year}-${suffix}`
}
