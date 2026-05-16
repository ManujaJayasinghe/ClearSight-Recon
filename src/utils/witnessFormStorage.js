const DESCRIPTION_KEY = 'clearsight-last-description'

/**
 * @param {Record<string, string>} description
 */
export function persistWitnessDescription(description) {
  try {
    if (!description || typeof description !== 'object') return
    sessionStorage.setItem(DESCRIPTION_KEY, JSON.stringify(description))
  } catch {
    // sessionStorage may be unavailable
  }
}

/**
 * @returns {Record<string, string> | null}
 */
export function loadPersistedWitnessDescription() {
  try {
    const raw = sessionStorage.getItem(DESCRIPTION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}
