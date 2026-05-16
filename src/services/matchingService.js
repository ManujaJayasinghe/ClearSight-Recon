import { getAllReports } from './reportStorage'

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

const TOTAL_FIELDS = MATCH_FIELDS.length

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
 * @param {Record<string, string>} currentDescriptors Witness form (camelCase) or snake_case row
 * @param {Record<string, string>} savedReport Row from criminal_reports
 * @returns {{ matchScore: number, matchedFields: string[], unmatchedFields: string[] }}
 */
function compareDescriptors(currentDescriptors, savedReport) {
  /** @type {string[]} */
  const matchedFields = []
  /** @type {string[]} */
  const unmatchedFields = []

  for (const { key, formKey } of MATCH_FIELDS) {
    const left = getDescriptorValue(currentDescriptors, key, formKey)
    const right = getDescriptorValue(savedReport, key, formKey)

    if (normalizeValue(left) === normalizeValue(right)) {
      matchedFields.push(key)
    } else {
      unmatchedFields.push(key)
    }
  }

  const matchScore = Math.round((matchedFields.length / TOTAL_FIELDS) * 100)

  return { matchScore, matchedFields, unmatchedFields }
}

/**
 * Compares witness descriptors against PDF-exported reports in localStorage.
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
  const reports = await getAllReports()

  const matches = reports
    .map((report) => {
      const savedDescriptors = report.descriptors ?? report
      const { matchScore, matchedFields, unmatchedFields } = compareDescriptors(
        currentDescriptors,
        savedDescriptors,
      )
      const matchType = getMatchType(matchScore)
      if (!matchType) return null

      return {
        caseNumber: report.caseNumber ?? report.case_number ?? '',
        createdDate: formatCreatedDate(report.createdDate ?? report.created_at),
        matchScore,
        matchType,
        matchedFields,
        unmatchedFields,
        reportId: report.reportId ?? report.id ?? '',
      }
    })
    .filter(Boolean)

  matches.sort((a, b) => b.matchScore - a.matchScore)

  return matches
}
