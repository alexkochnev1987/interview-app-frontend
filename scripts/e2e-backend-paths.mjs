import { constants } from 'node:fs'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'

async function pathExists(targetPath) {
  try {
    await access(targetPath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

export async function resolveBackendCwd(cwd = process.cwd()) {
  const candidates = [
    process.env.BACKEND_REPO_PATH,
    'interview-app-backend',
    '../interview-app-backend',
  ].filter(Boolean)

  for (const candidate of candidates) {
    const backendCwd = resolve(cwd, candidate)
    if (await pathExists(resolve(backendCwd, 'package.json'))) {
      return backendCwd
    }
  }

  throw new Error(
    'Backend repo not found. Set BACKEND_REPO_PATH or place it at interview-app-backend.',
  )
}

export async function resolveBackendMainPath(backendCwd) {
  const candidates = ['dist/src/main.js', 'dist/main.js'].map((segment) =>
    resolve(backendCwd, segment),
  )

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate
    }
  }

  throw new Error(`Backend entrypoint not found under ${backendCwd}`)
}

export async function resolveBackendMigratePath(backendCwd) {
  const candidates = [
    'dist/src/database/migrate.js',
    'dist/database/migrate.js',
  ].map((segment) => resolve(backendCwd, segment))

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate
    }
  }

  return null
}
