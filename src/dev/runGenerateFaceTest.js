import { generateFace, GenerationStatus } from '../utils/generateFace.js'

const TEST_DESCRIPTION = {
  gender: 'Male',
  ethnicity: 'South Asian',
  faceShape: 'Square',
  skinTone: 'Medium',
  ageRange: '30s',
  eyeShape: 'Deep-set',
  eyeColor: 'Brown',
  noseType: 'Straight, medium width',
  hairColor: 'Dark brown',
  hairLength: 'Short',
  facialHair: 'Light stubble',
  build: 'Athletic',
  scars: 'small scar above left eyebrow',
}

console.log('[generateFace test] Starting with description:', TEST_DESCRIPTION)

generateFace(TEST_DESCRIPTION, {
  onStatusChange: (status) => {
    console.log('[generateFace test] status:', status)
    if (status === GenerationStatus.REQUESTING) {
      console.log('[generateFace test] Calling fal-ai/flux-realism via API proxy…')
    }
  },
})
  .then((imageUrl) => {
    console.log('[generateFace test] Success — image URL:', imageUrl)
  })
  .catch((error) => {
    console.error('[generateFace test] Failed:', error)
  })
