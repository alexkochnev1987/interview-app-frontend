import { spawnSync } from 'node:child_process'

if (process.argv.includes('--fast')) {
  process.env.E2E_SKIP_WEBSERVER = '1'
}

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['playwright', 'test', ...process.argv.slice(2).filter((arg) => arg !== '--fast')],
  { stdio: 'inherit', env: process.env, shell: process.platform === 'win32' },
)

process.exit(result.status ?? 1)
