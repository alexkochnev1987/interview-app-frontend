import { spawn } from 'node:child_process'
import { constants } from 'node:fs'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'

function runNpmScript(scriptName, cwd, env) {
  return new Promise((resolvePromise, rejectPromise) => {
    const npmExecPath = process.env.npm_execpath
    const child = npmExecPath
      ? spawn(process.execPath, [npmExecPath, 'run', scriptName], {
          cwd,
          stdio: 'inherit',
          shell: false,
          env,
        })
      : spawn(
          process.platform === 'win32' ? 'cmd.exe' : 'npm',
          process.platform === 'win32'
            ? ['/d', '/s', '/c', `npm run ${scriptName}`]
            : ['run', scriptName],
          {
            cwd,
            stdio: 'inherit',
            shell: false,
            env,
            windowsVerbatimArguments: process.platform === 'win32',
          },
        )

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise()
        return
      }
      rejectPromise(new Error(`npm run ${scriptName} exited with code ${code ?? 'unknown'}`))
    })

    child.on('error', rejectPromise)
  })
}

async function pathExists(targetPath) {
  try {
    await access(targetPath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function main() {
  const backendCwd = resolve(
    process.cwd(),
    process.env.BACKEND_REPO_PATH ?? '../interview-app-backend',
  )
  const backendPackageJson = resolve(backendCwd, 'package.json')
  const backendMain = resolve(backendCwd, 'dist/main.js')

  try {
    await access(backendPackageJson, constants.F_OK)
  } catch {
    console.error(
      `[e2e] Backend repo not found at ${backendCwd}. Set BACKEND_REPO_PATH or start the API on :3000.`,
    )
    process.exit(1)
  }

  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: '3000',
    DATABASE_URL:
      process.env.E2E_DATABASE_URL ??
      'postgresql://interview_app:localpass@localhost:5433/interview_app_dev',
    JWT_SECRET: process.env.E2E_JWT_SECRET ?? 'e2e-local-jwt-secret',
    FRONTEND_URL: 'http://localhost:3001',
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET ?? 'interview-app-local',
    AWS_REGION: process.env.AWS_REGION ?? 'us-east-1',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? 'minioadmin',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ?? 'minioadmin',
    S3_ENDPOINT: process.env.S3_ENDPOINT ?? 'http://localhost:9002',
    S3_FORCE_PATH_STYLE: 'true',
    SUPER_ADMIN_EMAILS: process.env.SUPER_ADMIN_EMAILS ?? 'admin@interview-app.com',
  }

  if (process.env.CI || !(await pathExists(backendMain))) {
    await runNpmScript('build', backendCwd, env)
  }

  await runNpmScript('db:migrate:prod', backendCwd, env)

  const server = spawn(process.execPath, [backendMain], {
    cwd: backendCwd,
    stdio: 'inherit',
    shell: false,
    env,
  })

  server.on('exit', (code) => {
    process.exit(code ?? 1)
  })

  server.on('error', (error) => {
    console.error('[e2e] Failed to start backend:', error)
    process.exit(1)
  })
}

void main()
