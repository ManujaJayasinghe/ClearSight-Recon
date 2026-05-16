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

function ensureFalConfigured() {
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
  fal.config({ credentials: getFalKey() })
}

/**
 * @param {{ description?: object, prompt?: string, negativePrompt?: string, view?: 'front' | 'side', seed?: number }} body
 */
export function buildGenerationInput(body = {}) {
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

  if (typeof body.seed === 'number' && Number.isFinite(body.seed)) {
    falInput.seed = body.seed
  }

  return falInput
}

/**
 * Submits a job to the fal queue (returns immediately — safe for serverless timeouts).
 * @param {{ description?: object, prompt?: string, negativePrompt?: string, view?: 'front' | 'side', seed?: number, webhookUrl?: string }} body
 */
export async function submitFaceGenerationJob(body = {}) {
  ensureFalConfigured()
  const falInput = buildGenerationInput(body)

  const submitOptions = { input: falInput }
  if (body.webhookUrl?.trim()) {
    submitOptions.webhookUrl = body.webhookUrl.trim()
  }

  try {
    const { request_id: requestId } = await fal.queue.submit(
      FAL_MODEL_ID,
      submitOptions,
    )
    if (!requestId) {
      throw createHandlerError('fal.ai did not return a request ID.', {
        code: 'API',
        status: 502,
      })
    }
    return { requestId }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      throw createHandlerError(
        'fal.ai rejected your API key (Unauthorized). Check FAL_KEY in .env and restart the dev server.',
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

function extractImagesFromResult(result) {
  const imageUrls = (result.data?.images ?? [])
    .map((image) => image?.url)
    .filter((url) => typeof url === 'string' && url)

  const seed =
    typeof result.data?.seed === 'number' ? result.data.seed : undefined

  return { imageUrls, seed }
}

/**
 * @param {string} requestId
 */
export async function getFaceGenerationJobStatus(requestId) {
  ensureFalConfigured()

  if (!requestId?.trim()) {
    throw createHandlerError('requestId is required.', {
      code: 'VALIDATION',
      status: 400,
    })
  }

  try {
    const queueStatus = await fal.queue.status(FAL_MODEL_ID, {
      requestId: requestId.trim(),
      logs: false,
    })

    const normalized = String(queueStatus.status ?? '').toUpperCase()

    if (normalized === 'COMPLETED') {
      const result = await fal.queue.result(FAL_MODEL_ID, {
        requestId: requestId.trim(),
      })
      const { imageUrls, seed } = extractImagesFromResult(result)
      if (imageUrls.length === 0) {
        throw createHandlerError('Model completed but returned no image URLs.', {
          code: 'API',
          status: 502,
        })
      }
      return {
        status: 'completed',
        imageUrls,
        seed,
        queuePosition: queueStatus.queue_position ?? null,
      }
    }

    if (normalized === 'FAILED') {
      return {
        status: 'failed',
        message:
          queueStatus.error ??
          'fal.ai reported that generation failed. Try again in a moment.',
        queuePosition: queueStatus.queue_position ?? null,
      }
    }

    return {
      status: normalized === 'IN_PROGRESS' ? 'in_progress' : 'in_queue',
      queuePosition: queueStatus.queue_position ?? null,
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      throw createHandlerError(
        'fal.ai rejected your API key (Unauthorized). Check FAL_KEY in .env.',
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
