import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { falApiPlugin } from './server/falApiPlugin.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = process.cwd()
  const env = loadEnv(mode, envDir, '')

  for (const name of ['FAL_KEY', 'FAL_API_KEY']) {
    if (env[name]) {
      process.env[name] = env[name]
    }
  }

  return {
    envDir,
    plugins: [react(), falApiPlugin()],
  }
})
