import { spawn } from 'node:child_process'
import { constants } from 'node:fs'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'

function runCommand(command, args, cwd, env) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: false,
      env,
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise()
        return
      }
      rejectPromise(
        new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`),
      )
    })

    child.on('error', rejectPromise)
  })
}

function runNpmScript(scriptName, cwd, env) {
  const npmExecPath = process.env.npm_execpath
  if (npmExecPath) {
    return runCommand(process.execPath, [npmExecPath, 'run', scriptName], cwd, env)
  }

  if (process.platform === 'win32') {
    return runCommand('cmd.exe', ['/d', '/s', '/c', `npm run ${scriptName}`], cwd, env)
  }

  return runCommand('npm', ['run', scriptName], cwd, env)
}

async function pathExists(targetPath) {
  try {
    await access(targetPath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function resolveBackendCwd() {
  const candidates = [
    process.env.BACKEND_REPO_PATH,
    'interview-app-backend',
    '../interview-app-backend',
  ].filter(Boolean)

  for (const candidate of candidates) {
    const backendCwd = resolve(process.cwd(), candidate)
    if (await pathExists(resolve(backendCwd, 'package.json'))) {
      console.log(`[e2e] Using backend repo at ${backendCwd}`)
      return backendCwd
    }
  }

  throw new Error(
    '[e2e] Backend repo not found. Set BACKEND_REPO_PATH or place it at interview-app-backend.',
  )
}

async function runMigrations(cwd, env) {
  const migrateProdEntry = resolve(cwd, 'dist/database/migrate.js')
  const migrateSrcEntry = resolve(cwd, 'src/database/migrate.ts')
  const tsNodeBin = resolve(cwd, 'node_modules/ts-node/dist/bin.js')

  if (await pathExists(migrateProdEntry)) {
    console.log('[e2e] Running compiled migration')
    await runCommand(process.execPath, [migrateProdEntry], cwd, env)
    return
  }

  if (await pathExists(migrateSrcEntry) && (await pathExists(tsNodeBin))) {
    console.log('[e2e] Running ts-node migration')
    await runCommand(process.execPath, [tsNodeBin, migrateSrcEntry], cwd, env)
    return
  }

  if (await pathExists(migrateSrcEntry)) {
    console.log('[e2e] Running npx ts-node migration')
    await runCommand('npx', ['ts-node', migrateSrcEntry], cwd, env)
    return
  }

  throw new Error(`[e2e] No migration entrypoint found under ${cwd}`)
}

async function main() {
  const backendCwd = await resolveBackendCwd()
  const backendMain = resolve(backendCwd, 'dist/main.js')

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
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? 'e2e-google-client-id',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? 'e2e-google-client-secret',
    GOOGLE_CALLBACK_URL:
      process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/auth/google/callback',
  }

  if (process.env.CI || !(await pathExists(backendMain))) {
    console.log('[e2e] Building backend')
    await runNpmScript('build', backendCwd, env)
  }

  await runMigrations(backendCwd, env)

  console.log('[e2e] Starting backend API')
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
