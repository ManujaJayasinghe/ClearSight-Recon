import { FORM_SECTIONS } from '../constants/witnessFormSections'
import {
  translateFieldLabel,
  translateFormOption,
  translateSectionTitle,
} from '../i18n/formOption'

/** Witness form field (camelCase) → criminal_reports column (snake_case) */
export const FORM_KEY_TO_DB = {
  gender: 'gender',
  ethnicity: 'ethnicity',
  faceShape: 'face_shape',
  skinTone: 'skin_tone',
  ageRange: 'age_range',
  foreheadSize: 'forehead_size',
  eyeShape: 'eye_shape',
  eyeColor: 'eye_color',
  eyeSize: 'eye_size',
  eyebrowThickness: 'eyebrow_thickness',
  eyebrowShape: 'eyebrow_shape',
  noseType: 'nose_type',
  noseSize: 'nose_size',
  nostrilWidth: 'nostril_width',
  noseBridgeHeight: 'nose_bridge',
  lipThickness: 'lip_thickness',
  mouthWidth: 'mouth_width',
  hairColor: 'hair_color',
  hairLength: 'hair_length',
  hairStyle: 'hair_style',
  facialHair: 'facial_hair',
  cheekboneProminence: 'cheekbone_prominence',
  jawShape: 'jaw_shape',
  jawWidth: 'jaw_width',
  scarLocation: 'scar_location',
  scars: 'scar_description',
  tattoos: 'tattoos',
  birthmarkLocation: 'birthmark_location',
  birthmarks: 'birthmark_description',
  glasses: 'glasses',
  otherFeatures: 'other_features',
  height: 'height',
  build: 'build',
}

const OPTION_FORM_KEYS = new Set(Object.keys(FORM_KEY_TO_DB))

/**
 * @param {string} iso
 */
export function formatReportDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * @param {string} iso
 */
export function formatReportDateShort(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * @param {object} report
 * @param {string} formFieldKey
 */
export function getReportRawValue(report, formFieldKey) {
  const dbKey = FORM_KEY_TO_DB[formFieldKey]
  if (!dbKey || !report) return ''
  const raw = report[dbKey]
  return raw == null ? '' : String(raw).trim()
}

/**
 * @param {object} report
 * @param {string} formFieldKey
 */
export function getReportDisplayValue(report, formFieldKey) {
  const raw = getReportRawValue(report, formFieldKey)
  if (!raw) return null
  if (OPTION_FORM_KEYS.has(formFieldKey)) {
    return translateFormOption(formFieldKey, raw)
  }
  return raw
}

/**
 * @param {object} report
 * @returns {{ id: string, title: string, fields: { formKey: string, label: string, value: string }[] }[]}
 */
export function buildReportSections(report) {
  return FORM_SECTIONS.map((section) => {
    const fields = section.fields
      .filter((formKey) => FORM_KEY_TO_DB[formKey])
      .map((formKey) => {
        const value = getReportDisplayValue(report, formKey)
        if (!value) return null
        return {
          formKey,
          label: translateFieldLabel(formKey),
          value,
        }
      })
      .filter(Boolean)

    return {
      id: section.id,
      title: translateSectionTitle(section.id),
      fields,
    }
  }).filter((section) => section.fields.length > 0)
}

/**
 * @param {object} report
 */
export function getCardDescriptorSummary(report) {
  return [
    { label: translateFieldLabel('ethnicity'), value: getReportDisplayValue(report, 'ethnicity') },
    { label: translateFieldLabel('ageRange'), value: getReportDisplayValue(report, 'ageRange') },
    { label: translateFieldLabel('faceShape'), value: getReportDisplayValue(report, 'faceShape') },
    { label: translateFieldLabel('skinTone'), value: getReportDisplayValue(report, 'skinTone') },
  ].filter((item) => item.value)
}
