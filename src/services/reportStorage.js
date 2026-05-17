const STORAGE_KEY = 'sketchai_reports'

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
 * @param {{
 *   reportId?: string,
 *   caseNumber: string,
 *   descriptors: Record<string, string>,
 *   imageUrl: string,
 * }} data
 * @returns {{
 *   reportId: string,
 *   caseNumber: string,
 *   createdDate: string,
 *   descriptors: Record<string, string>,
 *   imageUrl: string,
 *   pdfExported: boolean,
 * }}
 */
export function saveReport(data) {
  const report = {
    reportId: data.reportId ?? crypto.randomUUID(),
    caseNumber: data.caseNumber ?? '',
    createdDate: new Date().toISOString(),
    descriptors: data.descriptors ?? {},
    imageUrl: data.imageUrl ?? '',
    pdfExported: true,
  }

  const reports = readAll()
  reports.unshift(report)
  writeAll(reports)
  return report
}

/**
 * @returns {object[]}
 */
export function getAllReports() {
  return readAll().sort(
    (a, b) =>
      new Date(b.createdDate ?? 0).getTime() -
      new Date(a.createdDate ?? 0).getTime(),
  )
}

/**
 * @param {string} reportId
 * @returns {object | null}
 */
export function getReportById(reportId) {
  if (!reportId?.trim()) return null
  return readAll().find((r) => r.reportId === reportId.trim()) ?? null
}

/**
 * @param {string} reportId
 * @returns {boolean}
 */
export function deleteReport(reportId) {
  if (!reportId?.trim()) return false
  const reports = readAll()
  const next = reports.filter((r) => r.reportId !== reportId.trim())
  if (next.length === reports.length) return false
  writeAll(next)
  return true
}
