import { dispatchFalApi } from './falApiRouter.js'
import { isFalKeyConfigured } from './falEnv.js'

function attachFalApi(server) {
  server.middlewares.use(async (req, res, next) => {
    const handled = await dispatchFalApi(req, res)
    if (!handled) {
      next()
    }
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
      '  1. Open .env in the project root (or Vercel project env vars)',
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
