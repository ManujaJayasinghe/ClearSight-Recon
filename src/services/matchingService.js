import { getAllReports } from './reportService'

/** @type {Record<string, number>} */
export const DESCRIPTOR_WEIGHTS = {
  ethnicity: 4,
  face_shape: 3,
  skin_tone: 3,
  facial_hair: 2,
  eye_shape: 2,
  nose_type: 2,
  age_range: 2,
  cheekbone_prominence: 2,
  jaw_shape: 2,
  hair_style: 1,
  hair_color: 1,
  eyebrow_thickness: 1,
  eyebrow_shape: 1,
  lip_thickness: 1,
}

const DEFAULT_WEIGHT = 1

/**
 * Descriptor fields compared during matching (DB snake_case + form camelCase).
 * @type {{ key: string, formKey: string }[]}
 */
const DESCRIPTOR_FIELDS = [
  { key: 'gender', formKey: 'gender' },
  { key: 'ethnicity', formKey: 'ethnicity' },
  { key: 'face_shape', formKey: 'faceShape' },
  { key: 'skin_tone', formKey: 'skinTone' },
  { key: 'age_range', formKey: 'ageRange' },
  { key: 'eye_shape', formKey: 'eyeShape' },
  { key: 'eye_color', formKey: 'eyeColor' },
  { key: 'eye_size', formKey: 'eyeSize' },
  { key: 'eyebrow_thickness', formKey: 'eyebrowThickness' },
  { key: 'eyebrow_shape', formKey: 'eyebrowShape' },
  { key: 'nose_type', formKey: 'noseType' },
  { key: 'nose_size', formKey: 'noseSize' },
  { key: 'nostril_width', formKey: 'nostrilWidth' },
  { key: 'nose_bridge', formKey: 'noseBridgeHeight' },
  { key: 'lip_thickness', formKey: 'lipThickness' },
  { key: 'mouth_width', formKey: 'mouthWidth' },
  { key: 'hair_color', formKey: 'hairColor' },
  { key: 'hair_length', formKey: 'hairLength' },
  { key: 'hair_style', formKey: 'hairStyle' },
  { key: 'facial_hair', formKey: 'facialHair' },
  { key: 'cheekbone_prominence', formKey: 'cheekboneProminence' },
  { key: 'jaw_shape', formKey: 'jawShape' },
  { key: 'jaw_width', formKey: 'jawWidth' },
  { key: 'forehead_size', formKey: 'foreheadSize' },
  { key: 'scar_location', formKey: 'scarLocation' },
  { key: 'scar_description', formKey: 'scars' },
  { key: 'tattoos', formKey: 'tattoos' },
  { key: 'birthmark_location', formKey: 'birthmarkLocation' },
  { key: 'birthmark_description', formKey: 'birthmarks' },
  { key: 'glasses', formKey: 'glasses' },
  { key: 'other_features', formKey: 'otherFeatures' },
  { key: 'height', formKey: 'height' },
  { key: 'build', formKey: 'build' },
]

/**
 * @param {string} fieldKey
 */
export function getFieldWeight(fieldKey) {
  return DESCRIPTOR_WEIGHTS[fieldKey] ?? DEFAULT_WEIGHT
}

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
 * @param {unknown} a
 * @param {unknown} b
 */
function valuesMatchExactly(a, b) {
  return normalizeValue(a) === normalizeValue(b)
}

/**
 * @param {Record<string, string>} newDescriptors Witness form (camelCase) or normalized object
 * @param {Record<string, string>} savedDescriptors Row from criminal_reports (snake_case)
 * @returns {{ score: number, matchedFields: string[] }}
 */
export function calculateMatchScore(newDescriptors, savedDescriptors) {
  let matchedWeight = 0
  let totalWeight = 0
  /** @type {string[]} */
  const matchedFields = []

  for (const { key, formKey } of DESCRIPTOR_FIELDS) {
    const left = getDescriptorValue(newDescriptors, key, formKey)
    const right = getDescriptorValue(savedDescriptors, key, formKey)
    const leftEmpty = normalizeValue(left) === ''
    const rightEmpty = normalizeValue(right) === ''

    if (leftEmpty && rightEmpty) {
      continue
    }

    const weight = getFieldWeight(key)
    totalWeight += weight

    if (valuesMatchExactly(left, right)) {
      matchedWeight += weight
      matchedFields.push(key)
    }
  }

  const score =
    totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 10000) / 100 : 0

  return { score, matchedFields }
}

/**
 * @param {number} score
 * @returns {'exact' | 'high' | 'possible' | null}
 */
export function getMatchLevel(score) {
  if (score >= 90) return 'exact'
  if (score >= 70) return 'high'
  if (score >= 50) return 'possible'
  return null
}

/**
 * @param {Record<string, string>} newDescriptors
 * @returns {Promise<{ report: object, score: number, level: string, matchedFields: string[] }[]>}
 */
export async function findMatches(newDescriptors) {
  const reports = await getAllReports()

  const results = reports
    .map((report) => {
      const { score, matchedFields } = calculateMatchScore(
        newDescriptors,
        report,
      )
      const level = getMatchLevel(score)
      if (!level) return null

      return {
        report,
        score,
        level,
        matchedFields,
      }
    })
    .filter(Boolean)

  results.sort((a, b) => b.score - a.score)

  return results
}
