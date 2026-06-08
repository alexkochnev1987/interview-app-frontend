import { createServer } from 'node:http'

const PORT = Number(process.env.E2E_MOCK_API_PORT ?? process.env.PORT ?? 3000)

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function handleRequest(req, res) {
  const { pathname } = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const method = req.method ?? 'GET'

  if (method === 'GET' && pathname === '/health') {
    json(res, 200, { status: 'ok', timestamp: new Date().toISOString() })
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
