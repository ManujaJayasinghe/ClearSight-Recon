const STORAGE_KEY = 'clearsight-criminal-reports'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}

/**
 * @returns {object[]}
 */
export function getLocalReports() {
  return readAll().sort(
    (a, b) =>
      new Date(b.created_at ?? 0).getTime() -
      new Date(a.created_at ?? 0).getTime(),
  )
}

/**
 * @param {string} id
 * @returns {object | null}
 */
export function getLocalReportById(id) {
  return readAll().find((r) => r.id === id) ?? null
}

/**
 * @param {object} row
 * @returns {object}
 */
export function saveLocalReport(row) {
  const reports = readAll()
  reports.unshift(row)
  writeAll(reports)
  return row
}
