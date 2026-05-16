import { FORM_OPTIONS } from '../constants/witnessForm'
import { FORM_SECTIONS } from '../constants/witnessFormSections'
import i18n from '../i18n'
import {
  translateFieldLabel,
  translateFormOption,
  translateSectionTitle,
} from '../i18n/formOption'

/** Fields that span full width in the summary layout. */
const FULL_WIDTH_FIELDS = new Set([
  'scars',
  'tattoos',
  'birthmarks',
  'otherFeatures',
  'scarLocation',
  'birthmarkLocation',
])

const OPTION_FIELDS = new Set(Object.keys(FORM_OPTIONS))

function formatDisplayValue(key, value) {
  if (!value) {
    return i18n.t('result.notSpecified')
  }
  if (OPTION_FIELDS.has(key)) {
    return translateFormOption(key, value)
  }
  return value
}

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
        label: translateFieldLabel(key),
        value,
        displayValue: formatDisplayValue(key, value),
        isFullWidth: FULL_WIDTH_FIELDS.has(key),
        isEmpty: !value,
      }
    })

    const fields = allFields.filter((field) => !field.isEmpty)

    return {
      id: section.id,
      title: translateSectionTitle(section.id),
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
