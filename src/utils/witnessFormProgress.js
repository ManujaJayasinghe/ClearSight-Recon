import { REQUIRED_FIELDS } from '../constants/witnessForm.js'
import { FORM_SECTIONS } from '../constants/witnessFormSections.js'
import i18n from '../i18n/index.js'
import { translateFieldLabel } from '../i18n/formOption.js'

/** @type {Record<string, string>} */
const FIELD_SATISFIED_BY_NONE = {
  scars: 'scarLocation',
  birthmarks: 'birthmarkLocation',
}

/**
 * @param {Record<string, string>} form
 * @param {string} field
 */
export function isFieldComplete(form, field) {
  if (form[field]?.trim()) return true
  const noneParent = FIELD_SATISFIED_BY_NONE[field]
  return noneParent != null && form[noneParent] === 'None'
}

/**
 * @param {{ fields: string[] }} section
 */
function getRequiredFieldsInSection(section) {
  return section.fields.filter((field) => REQUIRED_FIELDS.has(field))
}

/**
 * @param {Record<string, string>} form
 * @param {{ fields: string[] }} section
 */
export function isSectionComplete(form, section) {
  const required = getRequiredFieldsInSection(section)
  if (required.length === 0) return false
  return required.every((field) => isFieldComplete(form, field))
}

/**
 * @param {Record<string, string>} form
 */
export function getFormProgress(form) {
  const requiredSections = FORM_SECTIONS.filter(
    (section) => getRequiredFieldsInSection(section).length > 0,
  )
  const completed = requiredSections.filter((section) =>
    isSectionComplete(form, section),
  )
  return {
    completedCount: completed.length,
    totalCount: requiredSections.length,
    percent: requiredSections.length
      ? Math.round((completed.length / requiredSections.length) * 100)
      : 100,
    completedIds: new Set(completed.map((s) => s.id)),
  }
}

/**
 * @param {Record<string, string>} form
 * @returns {Record<string, string>}
 */
export function validateRequiredFields(form) {
  const errors = {}
  for (const field of REQUIRED_FIELDS) {
    if (!isFieldComplete(form, field)) {
      errors[field] = i18n.t('form.validationRequired', {
        field: translateFieldLabel(field),
      })
    }
  }
  return errors
}

/**
 * @param {Record<string, string>} errors
 */
export function getFirstSectionWithErrors(errors) {
  for (const section of FORM_SECTIONS) {
    if (section.fields.some((field) => errors[field])) {
      return section.id
    }
  }
  return FORM_SECTIONS[0].id
}
