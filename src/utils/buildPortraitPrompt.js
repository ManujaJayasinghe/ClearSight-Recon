import { FIELD_LABELS } from '../constants/witnessForm.js'

/**
 * Builds a detailed forensic-style portrait prompt from a witness description.
 * @param {Record<string, string>} description
 * @returns {string}
 */
export function buildPortraitPrompt(description = {}) {
  const parts = []

  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const value = description[key]
    if (value && String(value).trim()) {
      parts.push(`${label}: ${String(value).trim()}`)
    }
  }

  if (parts.length === 0) {
    return ''
  }

  return formatPortraitPrompt(parts.join(', '), 'front')
}

/**
 * @param {string} subjectDetails
 * @param {'front' | 'side'} view
 */
function formatPortraitPrompt(subjectDetails, view) {
  if (!subjectDetails.trim()) {
    return ''
  }

  const viewDirectives =
    view === 'side'
      ? [
          'Professional forensic composite sketch portrait, strict 90-degree side profile view,',
          'subject facing left, camera at ear level, full right ear and nose silhouette visible,',
          'single side of face only, no three-quarter angle,',
        ]
      : [
          'Professional forensic composite sketch portrait, front-facing head and shoulders,',
        ]

  return [
    ...viewDirectives,
    'neutral gray studio background, photorealistic, highly detailed facial features,',
    'accurate proportions, even forensic lighting, no smile, neutral expression,',
    'police identification photo style, sharp focus, high resolution.',
    `Subject description: ${subjectDetails}.`,
    'No text, no watermark, no multiple faces, single person only.',
  ].join(' ')
}

/**
 * Builds a side-profile (90°) forensic portrait prompt from a witness description.
 * @param {Record<string, string>} description
 * @returns {string}
 */
export function buildSideProfilePrompt(description = {}) {
  const parts = []

  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const value = description[key]
    if (value && String(value).trim()) {
      parts.push(`${label}: ${String(value).trim()}`)
    }
  }

  return formatPortraitPrompt(parts.join(', '), 'side')
}
