import { createServer } from 'node:http'

const PORT = Number(process.env.E2E_MOCK_API_PORT ?? process.env.PORT ?? 3000)

const DEMO_USER = {
  id: 'demo-e2e',
  email: 'demo@interview-app.com',
  name: 'Demo HR',
  role: 'hr',
  demo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
}
const DEMO_PERMISSIONS = ['questions:read', 'interviews:read_own']

function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers })
  res.end(JSON.stringify(body))
}

function hasSession(req) {
  return /(?:^|;\s*)session=/.test(req.headers.cookie ?? '')
}

function handleRequest(req, res) {
  const { pathname } = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const method = req.method ?? 'GET'

  if (method === 'GET' && pathname === '/health') {
    json(res, 200, { status: 'ok', timestamp: new Date().toISOString() })
    return
  }

  if (method === 'POST' && pathname === '/auth/demo') {
    json(res, 200, DEMO_USER, {
      'Set-Cookie': 'session=e2e-demo-session; Path=/; HttpOnly; SameSite=Lax',
    })
    return
  }

  if (method === 'POST' && pathname === '/auth/logout') {
    json(res, 200, { ok: true }, {
      'Set-Cookie': 'session=; Path=/; Max-Age=0',
    })
    return
  }

  if (method === 'GET' && pathname === '/auth/me') {
    if (!hasSession(req)) {
      json(res, 401, { message: 'Unauthorized', statusCode: 401 })
      return
    }
    json(res, 200, { ...DEMO_USER, permissions: DEMO_PERMISSIONS })
    return
  }

  if (method === 'GET' && pathname === '/interviews') {
    if (!hasSession(req)) {
      json(res, 401, { message: 'Unauthorized', statusCode: 401 })
      return
    }
    json(res, 200, [])
    return
  }

  if (method === 'GET' && pathname === '/questions') {
    json(res, 200, { items: [], total: 0, page: 1, limit: 20 })
    return
  }

  if (method === 'GET' && pathname === '/questions/facets') {
    json(res, 200, {
      difficulties: [],
      categories: [],
      subcategories: [],
      roles: [],
      tags: [],
    })
    return
  }

  json(res, 404, {
    message: `Mock API has no handler for ${method} ${pathname}`,
    statusCode: 404,
  })
}

export function startMockApi() {
  const server = createServer(handleRequest)

  server.listen(PORT, () => {
    console.log(`[e2e-mock-api] listening on http://localhost:${PORT}`)
  })

  return server
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  startMockApi()
}
