import { fal, ApiError } from '@fal-ai/client'
import { buildPortraitPrompt } from '../src/utils/buildPortraitPrompt.js'
import { getFalKey, isFalKeyConfigured } from './falEnv.js'

const MODEL_ID = 'fal-ai/flux/schnell'

function createHandlerError(message, { code, status, cause } = {}) {
  const error = new Error(message, { cause })
  error.code = code
  error.status = status
  return error
}

/**
 * Server-only: calls fal with FAL_KEY from .env (never sent to the browser).
 * @param {{ description?: object, prompt?: string }} body
 * @returns {Promise<{ imageUrl: string, requestId?: string }>}
 */
export async function runFaceGeneration(body = {}) {
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

  try {
    const result = await fal.subscribe(MODEL_ID, {
      input: {
        prompt,
        image_size: { width: 768, height: 960 },
        num_inference_steps: 4,
        num_images: 1,
        output_format: 'jpeg',
        enable_safety_checker: true,
      },
      logs: false,
    })

    const imageUrl = result.data?.images?.[0]?.url

    if (!imageUrl) {
      throw createHandlerError('Model completed but returned no image URL.', {
        code: 'API',
        status: 502,
      })
    }

    return { imageUrl, requestId: result.requestId }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      throw createHandlerError(
        'fal.ai rejected your API key (Unauthorized). Create a new key at https://fal.ai/dashboard/keys, set FAL_KEY in .env as id:secret (no quotes), then restart npm run dev.',
        { code: 'AUTH', status: 401, cause: err },
      )
    }

    if (err instanceof ApiError) {
      throw createHandlerError(err.message || 'fal.ai request failed', {
        code: 'API',
        status: err.status || 502,
        cause: err,
      })
    }

    throw err
  }
}
