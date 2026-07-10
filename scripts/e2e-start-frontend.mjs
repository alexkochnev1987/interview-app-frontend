import { cpSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const standaloneDir = path.join(rootDir, '.next', 'standalone')
const serverPath = path.join(standaloneDir, 'server.js')

function prepareStandalone() {
  if (!existsSync(serverPath)) {
    console.error(
      `[e2e-frontend] Missing ${serverPath}. Run "next build" before E2E.`,
    )
    process.exit(1)
  }

  const staticSource = path.join(rootDir, '.next', 'static')
  const staticTarget = path.join(standaloneDir, '.next', 'static')
  const publicSource = path.join(rootDir, 'public')
  const publicTarget = path.join(standaloneDir, 'public')

  if (!existsSync(staticSource)) {
    console.error(`[e2e-frontend] Missing ${staticSource}.`)
    process.exit(1)
  }

  mkdirSync(path.dirname(staticTarget), { recursive: true })
  cpSync(staticSource, staticTarget, { recursive: true })

  if (existsSync(publicSource)) {
    cpSync(publicSource, publicTarget, { recursive: true })
  }
}

prepareStandalone()

const port = process.env.PORT ?? process.env.E2E_FRONTEND_PORT ?? '3001'
const hostname = process.env.HOSTNAME ?? '0.0.0.0'

const child = spawn(process.execPath, [serverPath], {
  cwd: standaloneDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: port,
    HOSTNAME: hostname,
  },
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})
