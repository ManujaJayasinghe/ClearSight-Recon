import { FIELD_LABELS } from '../constants/witnessForm'
import { FORM_SECTIONS } from '../constants/witnessFormSections'

const TEXTAREA_FIELDS = new Set([
  'scars',
  'tattoos',
  'birthmarks',
  'otherFeatures',
])

/**
 * @param {Record<string, string>} description
 * @returns {{ id: string, title: string, fields: { key: string, label: string, value: string, isFullWidth: boolean }[] }[]}
 */
export function buildWitnessSummarySections(description) {
  return FORM_SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    fields: section.fields.map((key) => {
      const raw = description[key] ?? ''
      const value = raw.trim()
      return {
        key,
        label: formatFieldLabel(key),
        value: value || 'Not specified',
        isFullWidth: TEXTAREA_FIELDS.has(key),
        isEmpty: !value,
      }
    }),
  }))
}

function formatFieldLabel(key) {
  const label = FIELD_LABELS[key] ?? key
  return label.charAt(0).toUpperCase() + label.slice(1)
}
