import { spawnSync } from 'node:child_process'

import {
  E2E_FRONTEND_PORT,
  E2E_FRONTEND_URL,
  E2E_MOCK_API_PORT,
  E2E_MOCK_API_URL,
} from '../e2e/support/ports.mjs'

process.env.E2E_MOCK_API_PORT ??= E2E_MOCK_API_PORT
process.env.E2E_FRONTEND_PORT ??= E2E_FRONTEND_PORT
process.env.E2E_BASE_URL ??= E2E_FRONTEND_URL

if (process.argv.includes('--fast')) {
  process.env.E2E_SKIP_WEBSERVER = '1'
} else {
  process.env.BACKEND_URL = E2E_MOCK_API_URL
}

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['playwright', 'test', ...process.argv.slice(2).filter((arg) => arg !== '--fast')],
  { stdio: 'inherit', env: process.env, shell: process.platform === 'win32' },
)

process.exit(result.status ?? 1)
