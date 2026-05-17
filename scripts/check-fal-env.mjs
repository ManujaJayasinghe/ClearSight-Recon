import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { getFalKey } from '../server/falEnv.js'

const envPath = resolve(process.cwd(), '.env')
const key = getFalKey()

if (!existsSync(envPath)) {
  console.error('Missing .env file. Copy .env.example to .env first.')
  process.exit(1)
}

if (!key) {
  console.error('FAL_KEY is empty or missing in .env')
  console.error('Add your fal.ai key: FAL_KEY=your_id:your_secret')
  console.error('Get a key at https://fal.ai/dashboard/keys')
  process.exit(1)
}

console.log('FAL_KEY is configured (length:', key.length, 'characters)')
