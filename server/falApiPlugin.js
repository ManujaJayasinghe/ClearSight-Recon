import {
  runFaceGeneration,
  runFaceGenerationVariations,
} from './generateFaceHandler.js'
import {
  getFaceGenerationJobStatus,
  submitFaceGenerationJob,
} from './falAsyncGeneration.js'
import { isFalKeyConfigured } from './falEnv.js'

const API_PATH = '/api/generate-face'
const VARIATIONS_API_PATH = '/api/generate-face-variations'
const SUBMIT_SUFFIX = '/submit'
const STATUS_SUFFIX = '/status'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function parseRequestIds(url) {
  const query = url?.includes('?') ? url.split('?')[1] : ''
  const params = new URLSearchParams(query)
  const raw =
    params.get('requestIds') ?? params.get('requestId') ?? ''
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

function handlerErrorResponse(res, err, label) {
  console.error(`[fal-api] ${label}:`, err)
  const status = err.status ?? 500
  sendJson(res, status, {
    message: err.message ?? 'Face generation failed',
    code: err.code ?? 'API',
  })
}

async function handleGenerateFace(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'Method not allowed' })
    return
  }

  try {
    const body = await readJsonBody(req)
    const { imageUrl, seed } = await runFaceGeneration(body)
    sendJson(res, 200, { imageUrl, seed })
  } catch (err) {
    handlerErrorResponse(res, err, 'generate-face')
  }
}

async function handleGenerateFaceVariations(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'Method not allowed' })
    return
  }

  try {
    const body = await readJsonBody(req)
    const { imageUrls, seeds } = await runFaceGenerationVariations(body)
    sendJson(res, 200, { imageUrls, seeds })
  } catch (err) {
    handlerErrorResponse(res, err, 'generate-face-variations')
  }
}

async function handleSubmit(req, res, { count = 1, body: bodyOverride } = {}) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'Method not allowed' })
    return
  }

  try {
    const body = bodyOverride ?? (await readJsonBody(req))
    const jobCount = count > 1 ? count : 1
    const requestIds = await Promise.all(
      Array.from({ length: jobCount }, () => submitFaceGenerationJob(body)),
    ).then((jobs) => jobs.map((j) => j.requestId))

    sendJson(res, 202, {
      requestIds,
      requestId: requestIds[0],
      mode: 'async',
    })
  } catch (err) {
    handlerErrorResponse(res, err, 'submit')
  }
}

async function handleStatus(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { message: 'Method not allowed' })
    return
  }

  const requestIds = parseRequestIds(req.url)
  if (requestIds.length === 0) {
    sendJson(res, 400, {
      message: 'requestId or requestIds query parameter is required.',
      code: 'VALIDATION',
    })
    return
  }

  try {
    const jobs = await Promise.all(
      requestIds.map(async (requestId) => {
        const status = await getFaceGenerationJobStatus(requestId)
        return { requestId, ...status }
      }),
    )

    const failed = jobs.find((j) => j.status === 'failed')
    if (failed) {
      sendJson(res, 200, {
        status: 'failed',
        message: failed.message ?? 'Generation failed.',
        jobs,
      })
      return
    }

    const allComplete = jobs.every((j) => j.status === 'completed')
    if (allComplete) {
      const imageUrls = jobs.flatMap((j) => j.imageUrls ?? [])
      const seeds = jobs.map((j) => j.seed)
      sendJson(res, 200, {
        status: 'completed',
        imageUrl: imageUrls[0],
        imageUrls,
        seeds,
        jobs,
      })
      return
    }

    const inProgress = jobs.some((j) => j.status === 'in_progress')
    sendJson(res, 200, {
      status: inProgress ? 'in_progress' : 'in_queue',
      jobs,
    })
  } catch (err) {
    handlerErrorResponse(res, err, 'status')
  }
}

function attachFalApi(server) {
  server.middlewares.use(async (req, res, next) => {
    const pathname = req.url?.split('?')[0]

    if (pathname === `${API_PATH}${SUBMIT_SUFFIX}`) {
      await handleSubmit(req, res, { count: 1 })
      return
    }
    if (pathname === `${API_PATH}${STATUS_SUFFIX}`) {
      await handleStatus(req, res)
      return
    }
    if (pathname === `${VARIATIONS_API_PATH}${SUBMIT_SUFFIX}`) {
      const body = await readJsonBody(req)
      const count = Math.max(1, Math.min(Math.floor(body.count) || 3, 4))
      await handleSubmit(req, res, { count, body })
      return
    }
    if (pathname === `${VARIATIONS_API_PATH}${STATUS_SUFFIX}`) {
      await handleStatus(req, res)
      return
    }

    if (pathname === API_PATH) {
      await handleGenerateFace(req, res)
      return
    }
    if (pathname === VARIATIONS_API_PATH) {
      await handleGenerateFaceVariations(req, res)
      return
    }

    next()
  })
}

function logFalKeyStatus(logger) {
  if (isFalKeyConfigured()) {
    logger.info('fal.ai: API key loaded — async queue submit/status enabled')
    return
  }

  logger.warn(
    [
      '',
      'fal.ai: FAL_KEY is not configured.',
      '  1. Open .env in the project root',
      '  2. Set FAL_KEY=your_key_id:your_key_secret',
      '     (get a key at https://fal.ai/dashboard/keys)',
      '  3. Restart: npm run dev',
      '',
    ].join('\n'),
  )
}

export function falApiPlugin() {
  return {
    name: 'fal-api-proxy',
    configureServer(server) {
      attachFalApi(server)
      logFalKeyStatus(server.config.logger)
    },
    configurePreviewServer(server) {
      attachFalApi(server)
      logFalKeyStatus(server.config.logger)
    },
  }
}
