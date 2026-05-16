import {
  runFaceGeneration,
  runFaceGenerationVariations,
} from './generateFaceHandler.js'
import { isFalKeyConfigured } from './falEnv.js'

const API_PATH = '/api/generate-face'
const VARIATIONS_API_PATH = '/api/generate-face-variations'

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
    console.error('[fal-api] generate-face failed:', err)
    const status = err.status ?? 500
    sendJson(res, status, {
      message: err.message ?? 'Face generation failed',
      code: err.code ?? 'API',
    })
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
    console.error('[fal-api] generate-face-variations failed:', err)
    const status = err.status ?? 500
    sendJson(res, status, {
      message: err.message ?? 'Face generation failed',
      code: err.code ?? 'API',
    })
  }
}

function attachFalApi(server) {
  server.middlewares.use(async (req, res, next) => {
    const pathname = req.url?.split('?')[0]
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
    logger.info('fal.ai: API key loaded from .env')
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
