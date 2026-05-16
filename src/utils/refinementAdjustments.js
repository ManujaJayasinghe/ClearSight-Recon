import { FORM_OPTIONS } from '../constants/witnessForm'
import i18n from '../i18n'

const { ageRange, skinTone, hairLength, noseSize, eyeSize } = FORM_OPTIONS

function stepInList(list, current, delta) {
  const idx = list.indexOf(current)
  const base = idx === -1 ? (delta > 0 ? 0 : list.length - 1) : idx
  const next = Math.max(0, Math.min(list.length - 1, base + delta))
  return list[next]
}

/**
 * @param {Record<string, string>} description
 * @param {string} actionId
 * @returns {Record<string, string>}
 */
export function applyRefinement(description, actionId) {
  const next = { ...description }

  switch (actionId) {
    case 'nose-wider':
      next.noseSize = stepInList(noseSize, next.noseSize, 1)
      if (next.noseSize === 'Large' || next.noseSize === 'Medium') {
        next.noseType = 'Broad'
      }
      break
    case 'nose-narrower':
      next.noseSize = stepInList(noseSize, next.noseSize, -1)
      if (next.noseSize === 'Small' || next.noseSize === 'Medium') {
        next.noseType = 'Narrow'
      }
      break
    case 'hair-longer':
      next.hairLength = stepInList(hairLength, next.hairLength, 1)
      break
    case 'hair-shorter':
      next.hairLength = stepInList(hairLength, next.hairLength, -1)
      break
    case 'beard-add': {
      const current = next.facialHair || 'None'
      if (current === 'None' || current === '') {
        next.facialHair = 'Short beard'
      } else if (
        current === 'Light stubble' ||
        current === 'Heavy stubble'
      ) {
        next.facialHair = 'Goatee'
      } else {
        next.facialHair = 'Full beard'
      }
      break
    }
    case 'beard-remove':
      next.facialHair = 'None'
      break
    case 'eyes-larger':
      next.eyeSize = stepInList(eyeSize, next.eyeSize, 1)
      break
    case 'eyes-smaller':
      next.eyeSize = stepInList(eyeSize, next.eyeSize, -1)
      break
    case 'age-older':
      next.ageRange = stepInList(ageRange, next.ageRange, 1)
      break
    case 'age-younger':
      next.ageRange = stepInList(ageRange, next.ageRange, -1)
      break
    case 'skin-lighter':
      next.skinTone = stepInList(skinTone, next.skinTone, -1)
      break
    case 'skin-darker':
      next.skinTone = stepInList(skinTone, next.skinTone, 1)
      break
    default:
      break
  }

  return next
}

/** @type {{ id: string, label: string, group: string }[]} */
export const REFINEMENT_CONTROLS = [
  { id: 'nose-wider', label: 'Make nose wider', group: 'Nose' },
  { id: 'nose-narrower', label: 'Make nose narrower', group: 'Nose' },
  { id: 'hair-longer', label: 'Make hair longer', group: 'Hair' },
  { id: 'hair-shorter', label: 'Make hair shorter', group: 'Hair' },
  { id: 'beard-add', label: 'Add beard', group: 'Facial hair' },
  { id: 'beard-remove', label: 'Remove beard', group: 'Facial hair' },
  { id: 'eyes-larger', label: 'Eyes larger', group: 'Eyes' },
  { id: 'eyes-smaller', label: 'Eyes smaller', group: 'Eyes' },
  { id: 'age-older', label: 'Adjust age older', group: 'Age' },
  { id: 'age-younger', label: 'Adjust age younger', group: 'Age' },
  { id: 'skin-lighter', label: 'Change skin tone (lighter)', group: 'Skin tone' },
  { id: 'skin-darker', label: 'Change skin tone (darker)', group: 'Skin tone' },
]

const LABEL_BY_ID = Object.fromEntries(
  REFINEMENT_CONTROLS.map((c) => [c.id, c.label]),
)

export function getRefinementLabel(actionId) {
  return i18n.t(`refine.controls.${actionId}`, {
    defaultValue: LABEL_BY_ID[actionId] ?? i18n.t('refine.adjusted'),
  })
}
