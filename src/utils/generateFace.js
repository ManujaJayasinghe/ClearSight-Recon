import { buildPortraitPrompt, buildSideProfilePrompt } from './buildPortraitPrompt.js'

export { buildPortraitPrompt, buildSideProfilePrompt }

export const GenerationStatus = {
  IDLE: 'idle',
  BUILDING_PROMPT: 'building_prompt',
  REQUESTING: 'requesting',
  COMPLETE: 'complete',
  ERROR: 'error',
}

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

/**
 * @param {Record<string, string>} description
 * @param {{ onStatusChange?: (status: string) => void, prompt?: string }} [options]
 * @returns {Promise<string>} Generated image URL
 */
export async function generateFace(description, { onStatusChange, prompt: promptOverride } = {}) {
  const setStatus = (status) => onStatusChange?.(status)

  try {
    setStatus(GenerationStatus.BUILDING_PROMPT)
    const prompt = promptOverride ?? buildPortraitPrompt(description)

    if (!prompt.trim()) {
      throw new FaceGenerationError(
        'Add at least one witness description field before generating.',
        { code: 'VALIDATION' },
      )
    }

    setStatus(GenerationStatus.REQUESTING)

    let response
    try {
      response = await fetch('/api/generate-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, prompt }),
      })
    } catch (cause) {
      throw new FaceGenerationError(
        'Could not reach the generation service. Check your connection and try again.',
        { code: 'NETWORK', cause },
      )
    }

    let data = {}
    try {
      data = await response.json()
    } catch {
      data = {}
    }

    if (!response.ok) {
      throw new FaceGenerationError(
        data.message ?? `Generation failed (${response.status})`,
        {
          code: data.code ?? 'API',
          status: response.status,
          details: data,
        },
      )
    }

    const imageUrl = data.imageUrl
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new FaceGenerationError(
        'Server responded without an image URL.',
        { code: 'API', status: response.status, details: data },
      )
    }

    setStatus(GenerationStatus.COMPLETE)
    return imageUrl
  } catch (error) {
    setStatus(GenerationStatus.ERROR)

    if (error instanceof FaceGenerationError) {
      throw error
    }

    throw new FaceGenerationError(
      error?.message ?? 'An unexpected error occurred during generation.',
      { code: 'UNKNOWN', cause: error },
    )
  }
}
