import { FORM_SECTIONS } from '../constants/witnessFormSections.js'

/**
 * @param {Record<string, string>} form
 * @param {{ fields: string[] }} section
 */
export function isSectionComplete(form, section) {
  return section.fields.every((field) => Boolean(form[field]?.trim()))
}

/**
 * @param {Record<string, string>} form
 */
export function getFormProgress(form) {
  const completed = FORM_SECTIONS.filter((section) =>
    isSectionComplete(form, section),
  )
  return {
    completedCount: completed.length,
    totalCount: FORM_SECTIONS.length,
    percent: Math.round((completed.length / FORM_SECTIONS.length) * 100),
    completedIds: new Set(completed.map((s) => s.id)),
  }
}
