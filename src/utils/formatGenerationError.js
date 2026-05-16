import { FaceGenerationError } from './generateFace.js'

/**
 * User-facing message for fal.ai / network / validation failures.
 * @param {unknown} error
 * @returns {string}
 */
export function formatGenerationError(error) {
  if (error instanceof FaceGenerationError) {
    switch (error.code) {
      case 'CONFIG':
        return error.message
      case 'AUTH':
        return error.message
      case 'VALIDATION':
        return error.message
      case 'NETWORK':
        return error.message
      case 'TIMEOUT':
        return error.message
      case 'API':
        return error.message.includes('fal.ai')
          ? error.message
          : `The image service returned an error: ${error.message}`
      default:
        return error.message
    }
  }

  const message = error?.message ?? ''
  if (/abort/i.test(message) || /timed out/i.test(message)) {
    return 'Generation timed out. Each variation can take 1–2 minutes — use Retry to try again.'
  }
  if (/fetch|network|failed to fetch/i.test(message)) {
    return 'Could not reach the generation service. Check your connection and run the app with npm run dev.'
  }
  if (/unauthorized|401/i.test(message)) {
    return 'fal.ai rejected the API key. Verify FAL_KEY in .env and restart the server.'
  }
  if (/fal\.ai|fal-ai/i.test(message)) {
    return message
  }

  return message || 'Composite generation failed. Please try again.'
}

/**
 * @param {unknown} error
 */
export function isGenerationRetryable(error) {
  if (error instanceof FaceGenerationError) {
    return !['VALIDATION', 'CONFIG'].includes(error.code)
  }
  return true
}
