import { generateFace, GenerationStatus } from '../utils/generateFace.js'

const TEST_DESCRIPTION = {
  sex: 'male',
  ageRange: '30-40',
  ethnicity: 'Caucasian, medium complexion',
  build: 'athletic',
  hair: 'short dark brown hair, receding hairline',
  eyes: 'brown eyes, deep-set',
  facialHair: 'light stubble',
  nose: 'straight, medium width',
  distinguishing: 'small scar above left eyebrow',
  additional: 'wore a dark baseball cap during incident',
}

console.log('[generateFace test] Starting with description:', TEST_DESCRIPTION)

generateFace(TEST_DESCRIPTION, {
  onStatusChange: (status) => {
    console.log('[generateFace test] status:', status)
    if (status === GenerationStatus.REQUESTING) {
      console.log('[generateFace test] Calling fal-ai/flux/schnell via API proxy…')
    }
  },
})
  .then((imageUrl) => {
    console.log('[generateFace test] Success — image URL:', imageUrl)
  })
  .catch((error) => {
    console.error('[generateFace test] Failed:', error)
  })
