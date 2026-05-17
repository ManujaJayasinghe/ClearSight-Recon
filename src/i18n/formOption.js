import i18n from './index'

/**
 * Display label for a form option value (stored values stay in English for AI).
 * @param {string} field
 * @param {string} value
 */
export function translateFormOption(field, value) {
  if (!value) return ''
  return i18n.t(`options.${field}.${value}`, { defaultValue: value })
}

/**
 * @param {string} fieldKey
 */
export function translateFieldLabel(fieldKey) {
  return i18n.t(`form.fields.${fieldKey}`, {
    defaultValue: fieldKey,
  })
}

/**
 * @param {string} sectionId
 */
export function translateSectionTitle(sectionId) {
  return i18n.t(`form.sections.${sectionId}.title`, { defaultValue: sectionId })
}

/**
 * @param {string} sectionId
 */
export function translateSectionShortTitle(sectionId) {
  return i18n.t(`form.sections.${sectionId}.shortTitle`, {
    defaultValue: sectionId,
  })
}
