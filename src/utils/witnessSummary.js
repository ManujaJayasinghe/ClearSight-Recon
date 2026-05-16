import { FIELD_LABELS } from '../constants/witnessForm'
import { FORM_SECTIONS } from '../constants/witnessFormSections'

/** Fields that span full width in the summary layout. */
const FULL_WIDTH_FIELDS = new Set([
  'scars',
  'tattoos',
  'birthmarks',
  'otherFeatures',
  'scarLocation',
  'birthmarkLocation',
])

/**
 * @param {Record<string, string>} description
 * @returns {{ id: string, title: string, filledCount: number, totalCount: number, fields: { key: string, label: string, value: string, isFullWidth: boolean }[] }[]}
 */
export function buildWitnessSummarySections(description) {
  return FORM_SECTIONS.map((section) => {
    const allFields = section.fields.map((key) => {
      const raw = description[key] ?? ''
      const value = raw.trim()
      return {
        key,
        label: formatFieldLabel(key),
        value,
        displayValue: value || 'Not specified',
        isFullWidth: FULL_WIDTH_FIELDS.has(key),
        isEmpty: !value,
      }
    })

    const fields = allFields.filter((field) => !field.isEmpty)

    return {
      id: section.id,
      title: section.title,
      filledCount: fields.length,
      totalCount: section.fields.length,
      fields: fields.map(({ key, label, value, displayValue, isFullWidth }) => ({
        key,
        label,
        value: displayValue,
        isFullWidth,
        isEmpty: !value,
      })),
    }
  }).filter((section) => section.filledCount > 0)
}

function formatFieldLabel(key) {
  const label = FIELD_LABELS[key] ?? key
  return label.charAt(0).toUpperCase() + label.slice(1)
}
