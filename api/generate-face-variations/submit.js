import { VARIATIONS_API_PATH } from '../../server/falApiRouter.js'
import { apiRouteConfig, createVercelHandler } from '../../server/vercelApiHandler.js'

export const config = apiRouteConfig
export default createVercelHandler(`${VARIATIONS_API_PATH}/submit`)
