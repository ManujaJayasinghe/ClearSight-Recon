import { getAllReports as getCriminalReports } from './reportService'
import { getAllReports as getSketchaiReports } from './reportStorage'

/** Fields compared during witness-to-report matching (DB snake_case + form camelCase). */
const MATCH_FIELDS = [
  { key: 'face_shape', formKey: 'faceShape' },
  { key: 'skin_tone', formKey: 'skinTone' },
  { key: 'age_range', formKey: 'ageRange' },
  { key: 'eye_shape', formKey: 'eyeShape' },
  { key: 'eye_color', formKey: 'eyeColor' },
  { key: 'nose_type', formKey: 'noseType' },
  { key: 'hair_color', formKey: 'hairColor' },
  { key: 'hair_length', formKey: 'hairLength' },
  { key: 'facial_hair', formKey: 'facialHair' },
  { key: 'build', formKey: 'build' },
  { key: 'height', formKey: 'height' },
  { key: 'glasses', formKey: 'glasses' },
]

/**
 * @param {unknown} value
 */
function normalizeValue(value) {
  if (value == null) return ''
  return String(value).trim().toLowerCase()
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string} dbKey
 * @param {string} formKey
 */
function getDescriptorValue(obj, dbKey, formKey) {
  if (!obj || typeof obj !== 'object') return ''
  if (obj[dbKey] != null && obj[dbKey] !== '') return obj[dbKey]
  if (obj[formKey] != null && obj[formKey] !== '') return obj[formKey]
  return obj[dbKey] ?? obj[formKey] ?? ''
}

/**
 * @param {string} iso
 * @returns {string} e.g. "2026-05-16 14:32"
 */
function formatCreatedDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''

  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * @param {number} score
 * @returns {'exact' | 'high' | 'possible' | null}
 */
function getMatchType(score) {
  if (score >= 90) return 'exact'
  if (score >= 70) return 'high'
  if (score >= 50) return 'possible'
  return null
}

/**
 * @param {object} report
 */
function normalizeStoredReport(report) {
  if (!report || typeof report !== 'object') return null

  const reportId = report.reportId ?? report.id
  if (!reportId) return null

  const caseNumber = report.caseNumber ?? report.case_number ?? ''
  const createdDate = report.createdDate ?? report.created_at ?? ''

  // PDF index uses nested descriptors; criminal_reports rows use snake_case on the row
  const descriptors =
    report.descriptors && typeof report.descriptors === 'object'
      ? report.descriptors
      : report

  return { reportId, caseNumber, createdDate, descriptors }
}

/**
 * Loads reports from sketchai_reports (PDF export) and criminal_reports (Save Report).
 * @returns {Promise<object[]>}
 */
async function loadReportsForMatching() {
  const byId = new Map()

  for (const report of getSketchaiReports()) {
    const normalized = normalizeStoredReport(report)
    if (normalized) byId.set(normalized.reportId, normalized)
  }

  try {
    const criminal = await getCriminalReports()
    for (const report of criminal) {
      const normalized = normalizeStoredReport(report)
      if (normalized && !byId.has(normalized.reportId)) {
        byId.set(normalized.reportId, normalized)
      }
    }
  } catch (err) {
    console.warn('[matching] Could not load criminal reports for matching:', err)
  }

  return [...byId.values()]
}

/**
 * @param {Record<string, string>} currentDescriptors Witness form (camelCase) or snake_case row
 * @param {Record<string, unknown>} savedDescriptors Saved report descriptors
 * @returns {{ matchScore: number, matchedFields: string[], unmatchedFields: string[] }}
 */
function compareDescriptors(currentDescriptors, savedDescriptors) {
  /** @type {string[]} */
  const matchedFields = []
  /** @type {string[]} */
  const unmatchedFields = []
  let comparedCount = 0

  for (const { key, formKey } of MATCH_FIELDS) {
    const left = getDescriptorValue(currentDescriptors, key, formKey)
    const right = getDescriptorValue(savedDescriptors, key, formKey)
    const leftNorm = normalizeValue(left)
    const rightNorm = normalizeValue(right)

    if (leftNorm === '' && rightNorm === '') {
      continue
    }

    comparedCount += 1

    if (leftNorm === rightNorm) {
      matchedFields.push(key)
    } else {
      unmatchedFields.push(key)
    }
  }

  const matchScore =
    comparedCount > 0
      ? Math.round((matchedFields.length / comparedCount) * 100)
      : 0

  return { matchScore, matchedFields, unmatchedFields }
}

/**
 * Compares witness descriptors against all saved reports (PDF export + Save Report).
 *
 * @param {Record<string, string>} currentDescriptors
 * @returns {Promise<{
 *   caseNumber: string,
 *   createdDate: string,
 *   matchScore: number,
 *   matchType: 'exact' | 'high' | 'possible',
 *   matchedFields: string[],
 *   unmatchedFields: string[],
 *   reportId: string,
 * }[]>}
 */
export async function findMatches(currentDescriptors) {
  const reports = await loadReportsForMatching()

  const matches = reports
    .map((report) => {
      const { matchScore, matchedFields, unmatchedFields } = compareDescriptors(
        currentDescriptors,
        report.descriptors,
      )
      const matchType = getMatchType(matchScore)
      if (!matchType) return null

      return {
        caseNumber: report.caseNumber,
        createdDate: formatCreatedDate(report.createdDate),
        matchScore,
        matchType,
        matchedFields,
        unmatchedFields,
        reportId: report.reportId,
      }
    })
    .filter(Boolean)

  matches.sort((a, b) => b.matchScore - a.matchScore)

  return matches
}
