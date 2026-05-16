// ─── Style suffix tags appended after technical specs ───────────────────────
const PROMPT_SUFFIX =
  'photorealistic, 4K, RAW photograph, high detail, realistic skin texture, forensic identification quality'

const PROMPT_SUFFIX_SIDE =
  'photorealistic, 4K, RAW photograph, high detail, realistic skin texture, strict 90-degree side profile'

// ─── Maps ────────────────────────────────────────────────────────────────────

const SKIN_TONE_MAP = {
  'Very light': 'very fair, pale complexion',
  Light: 'light skin tone',
  Medium: 'medium skin tone',
  Olive: 'olive-toned complexion',
  Brown: 'brown skin tone',
  'Dark brown': 'dark brown complexion',
  Dark: 'very dark complexion',
}

const ETHNICITY_MAP = {
  'South Asian':
    'South Asian ethnicity, Indian subcontinent regional origin, South Asian facial bone structure and proportions',
  'East Asian':
    'East Asian ethnicity, East Asian regional origin, East Asian bone structure and eye morphology',
  'Southeast Asian':
    'Southeast Asian ethnicity, Southeast Asian regional origin, Southeast Asian facial bone structure',
  'Middle Eastern':
    'Middle Eastern ethnicity, Middle Eastern regional origin, Middle Eastern facial bone structure',
  'West African':
    'West African ethnicity, West African regional origin, West African facial bone structure and proportions',
  'East African':
    'East African ethnicity, East African regional origin, East African facial bone structure',
  European: 'European ethnicity, European regional origin, European facial bone structure',
  'Latin American':
    'Latin American ethnicity, blended indigenous and European heritage, Latin American facial features',
  Mixed: 'mixed ethnicity, blended facial features from multiple regional ancestries',
}

/**
 * Extra negative terms appended when ethnicity is non-European.
 * Counters the model's Eurocentric default tendencies.
 */
const EUROCENTRIC_NEGATIVE_TERMS = [
  'Caucasian default face',
  'generic European face',
  'Western European facial features only',
  'Eurocentric facial proportions',
  'white Western default features',
]

const AGE_RANGE_MAP = {
  Teenager: 'a teenager approximately 15–19 years old',
  '20s': 'a person in their twenties',
  '30s': 'a person in their thirties',
  '40s': 'a person in their forties',
  '50s': 'a person in their fifties',
  '60s+': 'a person in their sixties or older',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function get(d, ...keys) {
  for (const key of keys) {
    const v = d[key]
    if (v != null && String(v).trim()) return String(v).trim()
  }
  return ''
}

function lower(value) {
  return value.toLowerCase()
}

function joinParts(parts) {
  return parts.filter(Boolean).join(', ')
}

function omitNeutral(value, neutral = 'Medium') {
  return value && value !== neutral ? lower(value) : ''
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

/**
 * Builds an optimised natural-language forensic portrait prompt for FLUX Pro.
 *
 * Structure (order matters for FLUX attention):
 *   1. Short quality anchor
 *   2. Subject — age, gender, ethnicity
 *   3. Face features — top to bottom (face → eyes → nose → mouth → jaw → ears)
 *   4. Hair / facial hair
 *   5. Build
 *   6. Distinguishing marks (stated clearly with strong descriptors)
 *   7. Additional features
 *   8. Composition & pose
 *   9. Technical photography spec
 *  10. Style tags
 *  11. RENDER REQUIREMENT — restates critical marks so FLUX sees them twice
 *
 * @param {Record<string, string>} description
 * @param {'front' | 'side'} view
 * @returns {string}
 */
function buildNaturalPrompt(description = {}, view = 'front') {
  const d = description

  // Subject
  const gender = get(d, 'gender')
  const genderLabel = gender === 'Male' ? 'male' : gender === 'Female' ? 'female' : 'person'
  const ageRaw = get(d, 'ageRange', 'age_range')
  const agePhrasing = AGE_RANGE_MAP[ageRaw] || (ageRaw ? `a person in their ${ageRaw}` : 'an adult')
  const ethnicityRaw = get(d, 'ethnicity')
  const ethnicityDescriptor = ETHNICITY_MAP[ethnicityRaw] || ethnicityRaw

  // Face structure
  const faceShape = get(d, 'faceShape', 'face_shape')
  const skinToneRaw = get(d, 'skinTone', 'skin_tone')
  const skinTone = SKIN_TONE_MAP[skinToneRaw] || skinToneRaw
  const foreheadSize = get(d, 'foreheadSize', 'forehead_size')
  const foreheadShape = get(d, 'foreheadShape', 'forehead_shape')
  const foreheadParts = joinParts([
    omitNeutral(foreheadSize) ? `${omitNeutral(foreheadSize)} forehead` : '',
    foreheadShape ? `${lower(foreheadShape)} forehead shape` : '',
  ])
  const faceStructureParts = joinParts([
    faceShape ? `${lower(faceShape)}-shaped face` : '',
    skinTone,
    foreheadParts,
  ])

  // Eyes & brows
  const eyeShape = get(d, 'eyeShape', 'eye_shape')
  const eyeColor = get(d, 'eyeColor', 'eye_color')
  const eyeSize = get(d, 'eyeSize', 'eye_size')
  const eyebrowThickness = get(d, 'eyebrowThickness', 'eyebrow_thickness')
  const eyebrowShape = get(d, 'eyebrowShape', 'eyebrow_shape')
  const eyebrowColor = get(d, 'eyebrowColor', 'eyebrow_color')
  const eyes = joinParts([
    omitNeutral(eyeSize) ? `${omitNeutral(eyeSize)} eyes` : '',
    eyeShape ? `${lower(eyeShape)}-shaped eyes` : '',
    eyeColor ? `${lower(eyeColor)} eye color` : '',
    joinParts([
      omitNeutral(eyebrowThickness) ? `${omitNeutral(eyebrowThickness)} eyebrows` : '',
      eyebrowShape ? `${lower(eyebrowShape)} eyebrow shape` : '',
      eyebrowColor ? `${lower(eyebrowColor)} eyebrow color` : '',
    ]),
  ])

  // Nose
  const noseType = get(d, 'noseType', 'nose_type')
  const noseSize = get(d, 'noseSize', 'nose_size')
  const nostrilWidth = get(d, 'nostrilWidth', 'nostril_width')
  const noseBridgeHeight = get(d, 'noseBridgeHeight', 'nose_bridge_height')
  const nose = joinParts([
    omitNeutral(noseSize) ? `${omitNeutral(noseSize)}-sized nose` : '',
    noseType ? `${lower(noseType)} nose` : '',
    omitNeutral(nostrilWidth) ? `${omitNeutral(nostrilWidth)} nostrils` : '',
    omitNeutral(noseBridgeHeight) ? `${omitNeutral(noseBridgeHeight)} nose bridge` : '',
  ])

  // Mouth
  const lipThickness = get(d, 'lipThickness', 'lip_thickness')
  const mouthWidth = get(d, 'mouthWidth', 'mouth_width')
  const lipColor = get(d, 'lipColor', 'lip_color')
  const philtrumLength = get(d, 'philtrumLength', 'philtrum_length')
  const mouth = joinParts([
    lipThickness ? `${lower(lipThickness)} lips` : '',
    omitNeutral(mouthWidth) ? `${omitNeutral(mouthWidth)} mouth` : '',
    lipColor ? `${lower(lipColor)} lip color` : '',
    omitNeutral(philtrumLength) ? `${omitNeutral(philtrumLength)} philtrum` : '',
  ])

  // Jawline & cheeks
  const cheekboneProminence = get(d, 'cheekboneProminence', 'cheekbone_prominence')
  const jawShape = get(d, 'jawShape', 'jaw_shape')
  const jawWidth = get(d, 'jawWidth', 'jaw_width')
  const faceSymmetry = get(d, 'faceSymmetry', 'face_symmetry')
  const jawline = joinParts([
    cheekboneProminence ? `${lower(cheekboneProminence)} cheekbones` : '',
    jawShape ? `${lower(jawShape)} jaw` : '',
    omitNeutral(jawWidth) ? `${omitNeutral(jawWidth)} jaw width` : '',
    faceSymmetry ? `${lower(faceSymmetry)} facial symmetry` : '',
  ])

  // Ears
  const earSize = get(d, 'earSize', 'ear_size')
  const earProtrusion = get(d, 'earProtrusion', 'ear_protrusion')
  const ears = joinParts([
    omitNeutral(earSize) ? `${omitNeutral(earSize)} ears` : '',
    earProtrusion ? `${lower(earProtrusion)} ears` : '',
  ])

  // Hair
  const hairColor = get(d, 'hairColor', 'hair_color')
  const hairLength = get(d, 'hairLength', 'hair_length')
  const hairStyle = get(d, 'hairStyle', 'hair_style')
  const hair =
    hairLength === 'Bald' || hairColor === 'Bald'
      ? 'completely bald, no hair'
      : joinParts([
          hairColor ? lower(hairColor) : '',
          hairLength ? lower(hairLength) : '',
          hairStyle ? `${lower(hairStyle)} hair` : 'hair',
        ])

  // Facial hair
  const facialHairRaw = get(d, 'facialHair', 'facial_hair')
  const facialHair =
    facialHairRaw && facialHairRaw !== 'None' ? lower(facialHairRaw) : 'clean-shaven'

  // Build / physique
  const buildVal = get(d, 'build')
  const height = get(d, 'height')
  const neckLength = get(d, 'neckLength', 'neck_length')
  const neckWidth = get(d, 'neckWidth', 'neck_width')
  const physique = joinParts([
    buildVal ? `${lower(buildVal)} build` : '',
    height ? `${lower(height)} height` : '',
    omitNeutral(neckLength) ? `${omitNeutral(neckLength)} neck` : '',
    omitNeutral(neckWidth) ? `${omitNeutral(neckWidth)} neck width` : '',
  ])

  // Distinguishing marks — clear natural language; no ((...)) which is SD-only syntax
  const scarLocationRaw = get(d, 'scarLocation', 'scar_location')
  const scarDesc = get(d, 'scars')
  const birthmarkLocationRaw = get(d, 'birthmarkLocation', 'birthmark_location')
  const birthmarkDesc = get(d, 'birthmarks')
  const tattoos = get(d, 'tattoos')
  const glasses = get(d, 'glasses')
  const otherFeatures = get(d, 'otherFeatures', 'other_features')

  let scarSentence = ''
  if (scarLocationRaw !== 'None' && (scarLocationRaw || scarDesc)) {
    const loc = scarLocationRaw ? `on the ${lower(scarLocationRaw)}` : 'on the face'
    const desc = scarDesc ? `, ${scarDesc}` : ''
    scarSentence = `Prominently rendered scar ${loc}${desc}.`
  }

  let birthmarkSentence = ''
  if (birthmarkLocationRaw !== 'None' && (birthmarkLocationRaw || birthmarkDesc)) {
    const loc = birthmarkLocationRaw ? `at the ${lower(birthmarkLocationRaw)}` : 'on the face'
    const desc = birthmarkDesc ? `, ${birthmarkDesc}` : ''
    birthmarkSentence = `Clearly visible mole or birthmark ${loc}${desc}.`
  }

  const additionalParts = [
    tattoos ? `visible tattoo: ${tattoos}` : '',
    glasses && glasses !== 'None' ? `wearing ${lower(glasses)} glasses` : '',
    otherFeatures || '',
  ].filter(Boolean)

  // ── Assemble ─────────────────────────────────────────────────────────────

  const sentences = []

  // 1. Short quality anchor — sets the model's style prior immediately
  sentences.push('Photorealistic forensic composite portrait photograph.')

  // 2. Subject
  sentences.push(`Subject: ${agePhrasing}, ${genderLabel}.`)

  // 3. Ethnicity — stated once, clearly
  if (ethnicityDescriptor) {
    sentences.push(`Ethnicity: ${ethnicityDescriptor}.`)
  }

  // 4. Face features — top-to-bottom anatomical order
  if (faceStructureParts) sentences.push(`Face: ${faceStructureParts}.`)
  if (eyes) sentences.push(`Eyes: ${eyes}.`)
  if (nose) sentences.push(`Nose: ${nose}.`)
  if (mouth) sentences.push(`Mouth: ${mouth}.`)
  if (jawline) sentences.push(`Jawline: ${jawline}.`)
  if (ears) sentences.push(`Ears: ${ears}.`)

  // 5. Hair
  if (hair) sentences.push(`Hair: ${hair}.`)
  if (facialHairRaw || gender === 'Male') sentences.push(`Facial hair: ${facialHair}.`)

  // 6. Build
  if (physique) sentences.push(`Build: ${physique}.`)

  // 7. Distinguishing marks
  if (scarSentence) sentences.push(scarSentence)
  if (birthmarkSentence) sentences.push(birthmarkSentence)
  if (additionalParts.length) sentences.push(`Additional features: ${additionalParts.join('; ')}.`)

  // 8. Composition & pose
  if (view === 'side') {
    sentences.push(
      'Strict 90-degree side profile. Subject facing left. Camera at ear level. Single side of face visible. Plain neutral background.',
    )
  } else {
    sentences.push(
      'Front-facing headshot. Direct gaze into camera. Neutral expression. Plain neutral background.',
    )
  }

  // 9. Technical photography specification
  sentences.push(
    'Canon EOS R5, 85mm f/1.8 portrait lens. Three-point forensic studio lighting: soft key light, fill light, subtle rim light. Natural skin texture, visible pores, subsurface scattering, realistic dermal micro-detail. Sharp focus, single person, no text, no watermarks.',
  )

  // 10. Style / quality tags at end
  sentences.push(view === 'side' ? PROMPT_SUFFIX_SIDE : PROMPT_SUFFIX)

  // 11. RENDER REQUIREMENT — restates critical marks so FLUX's attention passes over them twice
  const criticalMarks = [scarSentence, birthmarkSentence].filter(Boolean)
  if (criticalMarks.length > 0) {
    sentences.push(
      `RENDER REQUIREMENT: ${criticalMarks.join(' ')} These marks must be clearly visible and accurately placed in the final image.`,
    )
  }

  return sentences.join(' ')
}

// ─── Public prompt builders ───────────────────────────────────────────────────

/**
 * Builds a front-facing forensic portrait prompt from witness description fields.
 * @param {Record<string, string>} description
 * @returns {string}
 */
export function buildPortraitPrompt(description = {}) {
  const hasAnyField = Object.values(description).some((v) => v != null && String(v).trim())
  if (!hasAnyField) return ''
  return buildNaturalPrompt(description, 'front')
}

/**
 * Builds a 90-degree side-profile prompt from witness description fields.
 * @param {Record<string, string>} description
 * @returns {string}
 */
export function buildSideProfilePrompt(description = {}) {
  const hasAnyField = Object.values(description).some((v) => v != null && String(v).trim())
  if (!hasAnyField) return ''
  return buildNaturalPrompt(description, 'side')
}

// ─── Negative prompt ──────────────────────────────────────────────────────────

const NEGATIVE_PROMPT_TERMS = [
  'cartoon',
  'anime',
  'manga',
  'illustration',
  'painting',
  'artistic rendering',
  'stylized',
  'CGI',
  '3D render',
  'plastic skin',
  'airbrushed',
  'overly smooth skin',
  'beauty filter',
  'heavy retouching',
  'blurry',
  'out of focus',
  'depth of field blur on face',
  'watermark',
  'text overlay',
  'logo',
  'multiple people',
  'crowd',
  'full body shot',
  'profile view',
  'looking away',
  'eyes closed',
  'sunglasses',
  'hat',
  'hood',
  'mask',
  'low quality',
  'low resolution',
  'bad anatomy',
  'deformed face',
  'asymmetric eyes',
  'distorted features',
  'disfigured',
  'extra fingers',
  'duplicate face',
  'split screen',
  'collage',
  'uncanny valley',
  'oversmoothed face',
]

const NEGATIVE_PROMPT_OMIT_FOR_SIDE = new Set(['profile view'])

/**
 * Builds the negative prompt string.
 * FLUX Pro has no native negative_prompt field — this is appended to the main prompt
 * as a "Do not render as…" clause, which FLUX follows reliably.
 * @param {{ view?: 'front' | 'side', description?: Record<string, string> }} [options]
 * @returns {string}
 */
export function buildNegativePrompt({ view = 'front', description = {} } = {}) {
  const terms =
    view === 'side'
      ? NEGATIVE_PROMPT_TERMS.filter((t) => !NEGATIVE_PROMPT_OMIT_FOR_SIDE.has(t))
      : [...NEGATIVE_PROMPT_TERMS]

  const ethnicity = get(description, 'ethnicity')
  if (ethnicity && ethnicity !== 'European') {
    terms.push(...EUROCENTRIC_NEGATIVE_TERMS)
  }

  return terms.join(', ')
}

// ─── Model & generation config ────────────────────────────────────────────────

/**
 * FLUX Pro 1.1 — Black Forest Labs' production model.
 * Significantly better facial accuracy and skin detail than flux-realism.
 */
export const FAL_MODEL_ID = 'fal-ai/flux-pro/v1.1'

/**
 * Generation parameters for flux-pro/v1.1.
 *
 * image_size    896×1152 — ~40% more pixels than portrait_4_3 for finer facial detail.
 * steps         50       — maximum for flux-pro; maximises sharpness.
 * guidance      4.5      — slightly above the FLUX default (3.5) for tighter prompt
 *                          adherence without over-saturation.
 * safety_tolerance "6"  — flux-pro string scale; "6" = most permissive (needed for
 *                          neutral forensic composites without any NSFW content).
 */
export const FAL_GENERATION_INPUT = {
  num_inference_steps: 50,
  guidance_scale: 4.5,
  image_size: { width: 896, height: 1152 },
  safety_tolerance: '6',
  output_format: 'jpeg',
}

/**
 * Builds a flux-pro/v1.1 fal input object.
 * Negative prompt is appended as a sentence (FLUX has no native negative_prompt field).
 * @param {{ prompt: string, negativePrompt?: string, seed?: number }} params
 */
export function buildFalInput({ prompt, negativePrompt, seed }) {
  const exclusions = negativePrompt?.trim()
  const avoidClause = exclusions ? ` Do not render as ${exclusions}.` : ''
  const fullPrompt = `${prompt}${avoidClause}`

  const input = {
    prompt: fullPrompt,
    image_size: FAL_GENERATION_INPUT.image_size,
    num_inference_steps: FAL_GENERATION_INPUT.num_inference_steps,
    guidance_scale: FAL_GENERATION_INPUT.guidance_scale,
    safety_tolerance: FAL_GENERATION_INPUT.safety_tolerance,
    output_format: FAL_GENERATION_INPUT.output_format,
    num_images: 1,
  }

  if (typeof seed === 'number' && Number.isFinite(seed)) {
    input.seed = seed
  }

  return input
}

// ─── Generation status ────────────────────────────────────────────────────────

export const GenerationStatus = {
  IDLE: 'idle',
  BUILDING_PROMPT: 'building_prompt',
  REQUESTING: 'requesting',
  COMPLETE: 'complete',
  ERROR: 'error',
}

// ─── Error class ──────────────────────────────────────────────────────────────

export class FaceGenerationError extends Error {
  /**
   * @param {string} message
   * @param {{ code?: string, status?: number, details?: unknown, cause?: Error }} [options]
   */
  constructor(message, { code = 'UNKNOWN', status, details, cause } = {}) {
    super(message, { cause })
    this.name = 'FaceGenerationError'
    this.code = code
    this.status = status
    this.details = details
  }
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function assertOkResponse(response, data) {
  if (!response.ok) {
    throw new FaceGenerationError(
      data.message ?? `Generation failed (${response.status})`,
      { code: data.code ?? 'API', status: response.status, details: data },
    )
  }
}

const GENERATION_FETCH_TIMEOUT_MS = 6 * 60 * 1000

async function postGenerationRequest(endpoint, payload) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), GENERATION_FETCH_TIMEOUT_MS)

  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (cause) {
    const isAbort = cause?.name === 'AbortError'
    const detail = cause?.message ?? 'Network error'
    throw new FaceGenerationError(
      isAbort
        ? 'Generation timed out. Each variation can take 1–2 minutes; try again.'
        : `Could not reach the generation service (${detail}). Start the app with "npm run dev".`,
      { code: 'NETWORK', cause },
    )
  } finally {
    clearTimeout(timeoutId)
  }

  let data
  try {
    data = await response.json()
  } catch {
    data = {}
  }

  assertOkResponse(response, data)
  return data
}

// ─── Public generation functions ──────────────────────────────────────────────

/**
 * Generates 3 parallel composite variations from a witness description.
 * Returns URLs and the seed used for each so callers can preserve face identity
 * across subsequent refinements.
 *
 * @param {Record<string, string>} description
 * @param {number} [count]
 * @param {{ onStatusChange?: (s: string) => void, prompt?: string, negativePrompt?: string, view?: 'front' | 'side' }} [options]
 * @returns {Promise<{ urls: string[], seeds: (number|undefined)[] }>}
 */
export async function generateFaceVariations(
  description,
  count = 3,
  { onStatusChange, prompt: promptOverride, negativePrompt: negativePromptOverride, view = 'front' } = {},
) {
  const setStatus = (s) => onStatusChange?.(s)

  try {
    setStatus(GenerationStatus.BUILDING_PROMPT)
    const prompt = promptOverride ?? buildPortraitPrompt(description)
    const negativePrompt = negativePromptOverride ?? buildNegativePrompt({ view, description })

    if (!prompt.trim()) {
      throw new FaceGenerationError(
        'Add at least one witness description field before generating.',
        { code: 'VALIDATION' },
      )
    }

    setStatus(GenerationStatus.REQUESTING)

    const data = await postGenerationRequest('/api/generate-face-variations', {
      description,
      prompt,
      negativePrompt,
      view,
      count,
    })

    const imageUrls = data.imageUrls
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      throw new FaceGenerationError('Server responded without image URLs.', {
        code: 'API',
        details: data,
      })
    }

    const urls = imageUrls.filter((u) => typeof u === 'string' && u)
    if (urls.length === 0) {
      throw new FaceGenerationError('Server responded without valid image URLs.', {
        code: 'API',
        details: data,
      })
    }

    setStatus(GenerationStatus.COMPLETE)

    // seeds array is parallel to urls; undefined if server didn't return one
    const seeds = Array.isArray(data.seeds) ? data.seeds : urls.map(() => undefined)
    return { urls, seeds }
  } catch (error) {
    setStatus(GenerationStatus.ERROR)
    if (error instanceof FaceGenerationError) throw error
    throw new FaceGenerationError(
      error?.message ?? 'An unexpected error occurred during generation.',
      { code: 'UNKNOWN', cause: error },
    )
  }
}

/**
 * Generates a single composite image.
 * Returns both the URL and the seed used, so callers can preserve face
 * identity when chaining refinement calls.
 *
 * @param {Record<string, string>} description
 * @param {{ onStatusChange?: (s: string) => void, prompt?: string, negativePrompt?: string, view?: 'front' | 'side', seed?: number }} [options]
 * @returns {Promise<{ imageUrl: string, seed: number | undefined }>}
 */
export async function generateFace(
  description,
  { onStatusChange, prompt: promptOverride, negativePrompt: negativePromptOverride, view = 'front', seed } = {},
) {
  const setStatus = (s) => onStatusChange?.(s)

  try {
    setStatus(GenerationStatus.BUILDING_PROMPT)
    const prompt = promptOverride ?? buildPortraitPrompt(description)
    const negativePrompt = negativePromptOverride ?? buildNegativePrompt({ view, description })

    if (!prompt.trim()) {
      throw new FaceGenerationError(
        'Add at least one witness description field before generating.',
        { code: 'VALIDATION' },
      )
    }

    setStatus(GenerationStatus.REQUESTING)

    const data = await postGenerationRequest('/api/generate-face', {
      description,
      prompt,
      negativePrompt,
      view,
      seed,
    })

    const imageUrl = data.imageUrl
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new FaceGenerationError('Server responded without an image URL.', {
        code: 'API',
        details: data,
      })
    }

    setStatus(GenerationStatus.COMPLETE)
    return { imageUrl, seed: typeof data.seed === 'number' ? data.seed : undefined }
  } catch (error) {
    setStatus(GenerationStatus.ERROR)
    if (error instanceof FaceGenerationError) throw error
    throw new FaceGenerationError(
      error?.message ?? 'An unexpected error occurred during generation.',
      { code: 'UNKNOWN', cause: error },
    )
  }
}
