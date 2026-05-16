/** @typedef {{ id: string, title: string, shortTitle: string, fields: string[], required?: boolean }} FormSectionConfig */

/** @type {FormSectionConfig[]} */
export const FORM_SECTIONS = [
  {
    id: 'face',
    title: 'Face Structure',
    shortTitle: 'Face',
    fields: ['faceShape', 'skinTone', 'ageRange'],
    required: true,
  },
  {
    id: 'eyes',
    title: 'Eyes',
    shortTitle: 'Eyes',
    fields: ['eyeShape', 'eyeColor', 'eyeSize'],
  },
  {
    id: 'nose',
    title: 'Nose',
    shortTitle: 'Nose',
    fields: ['noseType', 'noseSize'],
  },
  {
    id: 'mouth',
    title: 'Mouth and Lips',
    shortTitle: 'Mouth',
    fields: ['lipThickness', 'mouthWidth'],
  },
  {
    id: 'hair',
    title: 'Hair',
    shortTitle: 'Hair',
    fields: ['hairColor', 'hairLength', 'hairStyle'],
  },
  {
    id: 'facial-hair',
    title: 'Facial Hair',
    shortTitle: 'Facial Hair',
    fields: ['facialHair'],
  },
  {
    id: 'distinguishing',
    title: 'Distinguishing Features',
    shortTitle: 'Features',
    fields: ['scars', 'tattoos', 'birthmarks', 'glasses', 'otherFeatures'],
  },
  {
    id: 'build',
    title: 'Build',
    shortTitle: 'Build',
    fields: ['height', 'build'],
  },
]
