/** Alt + number/symbol → refinement action id */
export const REFINEMENT_KEY_MAP = {
  '1': 'nose-wider',
  '2': 'nose-narrower',
  '3': 'hair-longer',
  '4': 'hair-shorter',
  '5': 'beard-add',
  '6': 'beard-remove',
  '7': 'eyes-larger',
  '8': 'eyes-smaller',
  '9': 'age-older',
  '0': 'age-younger',
  '-': 'skin-lighter',
  '=': 'skin-darker',
}

/** @type {{ keys: string, description: string }[]} */
export const REFINEMENT_SHORTCUT_GROUPS = [
  { keys: 'Alt+1 / 2', description: 'Nose wider / narrower' },
  { keys: 'Alt+3 / 4', description: 'Hair longer / shorter' },
  { keys: 'Alt+5 / 6', description: 'Add / remove beard' },
  { keys: 'Alt+7 / 8', description: 'Eyes larger / smaller' },
  { keys: 'Alt+9 / 0', description: 'Age older / younger' },
  { keys: 'Alt+- / =', description: 'Skin lighter / darker' },
]

export function getShortcutLabel(actionId) {
  const entry = Object.entries(REFINEMENT_KEY_MAP).find(([, id]) => id === actionId)
  return entry ? `Alt+${entry[0]}` : null
}
