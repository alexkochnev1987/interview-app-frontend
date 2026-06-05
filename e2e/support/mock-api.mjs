import { createServer } from 'node:http'
import { parse as parseUrl } from 'node:url'

import { createTestUser, e2eCredentials } from './fixtures.mjs'

const PORT = Number(process.env.E2E_MOCK_API_PORT ?? process.env.PORT ?? 3000)
const SESSION_COOKIE = 'session'

/** @type {Map<string, ReturnType<typeof createTestUser>>} */
const sessions = new Map()

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function parseCookies(header) {
  if (!header) {
    return {}
  }

  return Object.fromEntries(
    header.split(';').map((part) => {
      const [name, ...rest] = part.trim().split('=')
      return [name, rest.join('=')]
    }),
  )
}

function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
  )
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  )
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []

    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function getSessionUser(req) {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[SESSION_COOKIE]
  if (!token) {
    return null
  }

  return sessions.get(token) ?? null
}

async function handleRequest(req, res) {
  const { pathname } = parseUrl(req.url ?? '/', true)
  const method = req.method ?? 'GET'

  if (method === 'GET' && pathname === '/health') {
    json(res, 200, { status: 'ok', timestamp: new Date().toISOString() })
    return
  }

  if (method === 'POST' && pathname === '/auth/login') {
    let body
    try {
      body = await readJsonBody(req)
    } catch {
      json(res, 400, { message: 'Invalid JSON body', statusCode: 400 })
      return
    }

    if (
      body.email !== e2eCredentials.email ||
      body.password !== e2eCredentials.password
    ) {
      json(res, 401, { message: 'Invalid credentials', statusCode: 401 })
      return
    }

    const user = createTestUser()
    const token = `e2e-session-${user.id}`
    sessions.set(token, user)
    setSessionCookie(res, token)
    json(res, 200, user)
    return
  }

  if (method === 'GET' && pathname === '/auth/me') {
    const user = getSessionUser(req)
    if (!user) {
      json(res, 401, { message: 'Unauthorized', statusCode: 401 })
      return
    }

    json(res, 200, user)
    return
  }

  if (method === 'POST' && pathname === '/auth/logout') {
    const cookies = parseCookies(req.headers.cookie)
    const token = cookies[SESSION_COOKIE]
    if (token) {
      sessions.delete(token)
    }
    clearSessionCookie(res)
    json(res, 200, { ok: true })
    return
  }

  json(res, 404, {
    message: `Mock API has no handler for ${method} ${pathname}`,
    statusCode: 404,
  })
}

export function startMockApi() {
  const server = createServer((req, res) => {
    void handleRequest(req, res).catch((error) => {
      console.error('[e2e-mock-api] request failed:', error)
      json(res, 500, { message: 'Internal mock API error', statusCode: 500 })
    })
  })

  server.listen(PORT, () => {
    console.log(`[e2e-mock-api] listening on http://localhost:${PORT}`)
  })

  return server
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  startMockApi()
}
