import { dispatchFalApi } from '../server/falApiRouter.js'

export const config = {
  maxDuration: 60,
}

/**
 * Vercel serverless handler for /api/generate-face* routes.
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  const segments = req.query.path
  const pathPart = Array.isArray(segments)
    ? segments.join('/')
    : segments
      ? String(segments)
      : ''

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(req.query ?? {})) {
    if (key === 'path') continue
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, String(v))
    } else if (value != null) {
      params.set(key, String(value))
    }
  }

  const qs = params.toString()
  req.url = `/api/${pathPart}${qs ? `?${qs}` : ''}`

  const handled = await dispatchFalApi(req, res)
  if (!handled) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message: 'Not found' }))
  }
}
