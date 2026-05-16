import { fal, ApiError } from '@fal-ai/client'
import { buildPortraitPrompt } from '../src/utils/buildPortraitPrompt.js'
import {
  buildFalInput,
  buildNegativePrompt,
  FAL_MODEL_ID,
} from '../src/utils/generateFace.js'
import { getFalKey, isFalKeyConfigured } from './falEnv.js'

function createHandlerError(message, { code, status, cause } = {}) {
  const error = new Error(message, { cause })
  error.code = code
  error.status = status
  return error
}

const FAL_REQUEST_TIMEOUT_MS = 5 * 60 * 1000

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

function formatFalError(err) {
  if (err?.name === 'ValidationError' && typeof err.fieldErrors !== 'undefined') {
    const details = err.fieldErrors
      .map((e) => e.msg || JSON.stringify(e))
      .filter(Boolean)
      .join('; ')
    if (details) {
      return `Invalid generation request: ${details}`
    }
  }
  return err.message || 'fal.ai request failed'
}

/**
 * @param {{ description?: object, prompt?: string, negativePrompt?: string, view?: 'front' | 'side', seed?: number }} body
 * @returns {Promise<{ imageUrls: string[], seed?: number }>}
 */
async function executeFaceGeneration(body = {}) {
  if (!isFalKeyConfigured()) {
    throw createHandlerError(
      [
        'FAL_KEY is not configured.',
        'Add FAL_KEY=your_id:your_secret to the .env file in the project root',
        '(see .env.example), then restart npm run dev.',
        'Create a key at https://fal.ai/dashboard/keys',
      ].join(' '),
      { code: 'CONFIG', status: 500 },
    )
  }

  const apiKey = getFalKey()
  fal.config({ credentials: apiKey })

  const prompt =
    body.prompt?.trim() || buildPortraitPrompt(body.description ?? {})

  if (!prompt) {
    throw createHandlerError(
      'Description is empty. Provide at least one witness detail.',
      { code: 'VALIDATION', status: 400 },
    )
  }

  const view = body.view === 'side' ? 'side' : 'front'
  const negativePrompt =
    body.negativePrompt?.trim() ||
    buildNegativePrompt({ view, description: body.description ?? {} })

  const falInput = buildFalInput({ prompt, negativePrompt })

  // Seed: pass through if provided (keeps face identity stable across refinements)
  if (typeof body.seed === 'number' && Number.isFinite(body.seed)) {
    falInput.seed = body.seed
  }

  try {
    const result = await withTimeout(
      fal.subscribe(FAL_MODEL_ID, {
        input: falInput,
        logs: false,
      }),
      FAL_REQUEST_TIMEOUT_MS,
      'fal.ai request timed out after 5 minutes',
    )

    const imageUrls = (result.data?.images ?? [])
      .map((image) => image?.url)
      .filter((url) => typeof url === 'string' && url)

    if (imageUrls.length === 0) {
      throw createHandlerError('Model completed but returned no image URLs.', {
        code: 'API',
        status: 502,
      })
    }

    const seed =
      typeof result.data?.seed === 'number' ? result.data.seed : undefined

    return { imageUrls, seed }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      throw createHandlerError(
        'fal.ai rejected your API key (Unauthorized). Create a new key at https://fal.ai/dashboard/keys, set FAL_KEY in .env as id:secret (no quotes), then restart npm run dev.',
        { code: 'AUTH', status: 401, cause: err },
      )
    }

    if (err instanceof ApiError) {
      throw createHandlerError(formatFalError(err), {
        code: 'API',
        status: err.status || 502,
        cause: err,
      })
    }

    throw err
  }
}

/**
 * Server-only: calls fal with FAL_KEY from .env (never sent to the browser).
 * @param {{ description?: object, prompt?: string, negativePrompt?: string, view?: 'front' | 'side', seed?: number }} body
 * @returns {Promise<{ imageUrl: string, seed?: number, requestId?: string }>}
 */
export async function runFaceGeneration(body = {}) {
  const { imageUrls, seed } = await executeFaceGeneration(body)
  return { imageUrl: imageUrls[0], seed }
}

/**
 * flux-realism allows only one image per request; run parallel jobs for variations.
 * @param {{ description?: object, prompt?: string, negativePrompt?: string, view?: 'front' | 'side', count?: number }} body
 * @returns {Promise<{ imageUrls: string[], seeds: (number|undefined)[] }>}
 */
export async function runFaceGenerationVariations(body = {}) {
  const count = Math.max(1, Math.min(Math.floor(body.count) || 3, 4))

  // Fire all requests in parallel for ~3× speed improvement
  const results = await Promise.all(
    Array.from({ length: count }, () => executeFaceGeneration(body)),
  )

  const imageUrls = results.map((r) => r.imageUrls[0]).filter(Boolean)
  const seeds = results.map((r) => r.seed)

  if (imageUrls.length === 0) {
    throw createHandlerError('Model completed but returned no image URLs.', {
      code: 'API',
      status: 502,
    })
  }

  return { imageUrls, seeds }
}
