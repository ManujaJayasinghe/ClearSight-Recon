import { dispatchFalApi } from './falApiRouter.js'

export const apiRouteConfig = {
  maxDuration: 60,
}

/**
 * @param {string} pathname e.g. /api/generate-face/submit
 */
export function createVercelHandler(pathname) {
  return async function handler(req, res) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(req.query ?? {})) {
      if (Array.isArray(value)) {
        for (const v of value) params.append(key, String(v))
      } else if (value != null) {
        params.set(key, String(value))
      }
    }

    const qs = params.toString()
    req.url = pathname + (qs ? `?${qs}` : '')

    const handled = await dispatchFalApi(req, res)
    if (!handled) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ message: 'Not found' }))
    }
  }
}
