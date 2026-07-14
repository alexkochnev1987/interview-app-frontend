import { createServer } from 'node:http'

import {
  authUser,
  buildInterviewFacets,
  createInitialInterviews,
  E2E_SESSION_TOKEN,
  EMPTY_INTERVIEW_FACETS,
  EMPTY_QUESTION_FACETS,
  MOCK_QUESTIONS,
  toInterviewListItem,
} from './fixtures.mjs'

const PORT = Number(process.env.E2E_MOCK_API_PORT ?? process.env.PORT ?? 3000)

const DEMO_SESSION_TOKEN = 'e2e-demo-session'
const DEMO_USER = {
  id: 'demo-e2e',
  email: 'demo@interview-app.com',
  name: 'Demo HR',
  role: 'hr',
  demo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
}
const DEMO_PERMISSIONS = ['questions:read', 'interviews:read_own']

/** @type {ReturnType<typeof createInitialInterviews>} */
let interviews = createInitialInterviews()

function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers })
  res.end(JSON.stringify(body))
}

function readSession(req) {
  const cookie = req.headers.cookie ?? ''
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/)
  return match?.[1] ?? null
}

function isAuthed(req) {
  const session = readSession(req)
  return session === E2E_SESSION_TOKEN || session === DEMO_SESSION_TOKEN
}

function isDemoSession(req) {
  return readSession(req) === DEMO_SESSION_TOKEN
}

async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

function paginate(items, query) {
  const page = Math.max(1, Number(query.get('page') ?? 1))
  const limit = Math.max(1, Number(query.get('limit') ?? 20))
  const start = (page - 1) * limit
  const slice = items.slice(start, start + limit)
  return { items: slice, total: items.length, page, limit }
}

function filterQuestions(query) {
  let items = MOCK_QUESTIONS.filter((q) => !q.deleted)

  const status = query.get('status') ?? 'active'
  if (status === 'active') {
    items = items.filter((q) => !q.deleted)
  } else if (status === 'scheduled') {
    items = items.filter((q) => q.pendingDeletion && !q.deleted)
  } else if (status === 'inactive') {
    items = items.filter((q) => q.deleted)
  }

  if (query.get('eligibleForInterview') === 'true') {
    items = items.filter((q) => !q.pendingDeletion && !q.deleted)
  }

  const q = query.get('q')?.trim()
  if (q) {
    items = items.filter((item) =>
      item.questionText.toLowerCase().includes(q.toLowerCase()),
    )
  }

  return items
}

function filterInterviewListItems(query) {
  let items = interviews.map(toInterviewListItem)

  const q = query.get('q')?.trim()
  if (q) {
    items = items.filter((item) =>
      item.candidateName.toLowerCase().includes(q.toLowerCase()),
    )
  }

  const status = query.get('status')
  if (status) {
    items = items.filter((item) => item.status === status)
  }

  const position = query.get('position')
  if (position) {
    items = items.filter((item) => item.position === position)
  }

  const sortBy = query.get('sortBy') ?? 'updatedAt'
  const sortOrder = query.get('sortOrder') === 'asc' ? 1 : -1
  items.sort((left, right) => {
    if (sortBy === 'candidateName') {
      return left.candidateName.localeCompare(right.candidateName) * sortOrder
    }
    const leftValue = left[sortBy] ?? left.updatedAt
    const rightValue = right[sortBy] ?? right.updatedAt
    if (leftValue === rightValue) return 0
    return leftValue > rightValue ? sortOrder : -sortOrder
  })

  return items
}

function findInterview(id) {
  return interviews.find((item) => item.id === id)
}

async function handleRequest(req, res) {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const { pathname } = url
  const method = req.method ?? 'GET'

  if (method === 'GET' && pathname === '/health') {
    json(res, 200, { status: 'ok', timestamp: new Date().toISOString() })
    return
  }

  if (method === 'POST' && pathname === '/__e2e__/reset') {
    resetMockState()
    json(res, 200, { ok: true })
    return
  }

  if (method === 'POST' && pathname === '/auth/login') {
    await readJsonBody(req)
    json(res, 200, authUser(), {
      'Set-Cookie': `session=${E2E_SESSION_TOKEN}; Path=/; HttpOnly; SameSite=Lax`,
    })
    return
  }

  if (method === 'POST' && pathname === '/auth/demo') {
    json(res, 200, DEMO_USER, {
      'Set-Cookie': `session=${DEMO_SESSION_TOKEN}; Path=/; HttpOnly; SameSite=Lax`,
    })
    return
  }

  if (method === 'POST' && pathname === '/auth/logout') {
    json(res, 200, { ok: true }, {
      'Set-Cookie': 'session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax',
    })
    return
  }

  if (method === 'GET' && pathname === '/auth/me') {
    if (!isAuthed(req)) {
      json(res, 401, { message: 'Unauthorized', statusCode: 401 })
      return
    }
    if (isDemoSession(req)) {
      json(res, 200, { ...DEMO_USER, permissions: DEMO_PERMISSIONS })
      return
    }
    json(res, 200, authUser())
    return
  }

  if (!isAuthed(req)) {
    json(res, 401, { message: 'Unauthorized', statusCode: 401 })
    return
  }

  if (method === 'GET' && pathname === '/questions') {
    json(res, 200, paginate(filterQuestions(url.searchParams), url.searchParams))
    return
  }

  if (method === 'GET' && pathname === '/questions/facets') {
    json(res, 200, EMPTY_QUESTION_FACETS)
    return
  }

  if (method === 'GET' && pathname === '/interviews/facets') {
    const filtered = filterInterviewListItems(url.searchParams)
    json(
      res,
      200,
      filtered.length > 0
        ? buildInterviewFacets(filtered)
        : EMPTY_INTERVIEW_FACETS,
    )
    return
  }

  if (method === 'GET' && pathname === '/interviews') {
    json(
      res,
      200,
      paginate(filterInterviewListItems(url.searchParams), url.searchParams),
    )
    return
  }

  const interviewMatch = pathname.match(
    /^\/interviews\/([^/]+)(?:\/(cancel|candidate-link|results))?$/,
  )

  if (interviewMatch) {
    const [, id, action] = interviewMatch
    const current = findInterview(id)

    if (!current) {
      json(res, 404, { message: 'Interview not found', statusCode: 404 })
      return
    }

    if (method === 'GET' && !action) {
      json(res, 200, current)
      return
    }

    if (method === 'GET' && action === 'results') {
      json(res, 200, current.result ?? {
        overallScore: 0,
        summary: 'No results yet',
        categoryScores: {},
        completedAt: current.updatedAt,
      })
      return
    }

    if (method === 'POST' && action === 'candidate-link') {
      json(res, 200, {
        candidateLink: `https://example.test/take/${id}`,
      })
      return
    }

    if (method === 'PATCH' && action === 'cancel') {
      interviews = interviews.filter((item) => item.id !== id)
      json(res, 200, { id, canceled: true })
      return
    }

    if (method === 'DELETE' && !action) {
      if (isDemoSession(req)) {
        json(res, 403, { message: 'Forbidden', statusCode: 403 })
        return
      }

      if (current.status !== 'completed' && current.status !== 'failed') {
        json(res, 409, {
          message:
            'Interview can only be deleted while status is completed or failed',
          statusCode: 409,
        })
        return
      }

      interviews = interviews.filter((item) => item.id !== id)
      json(res, 200, { id, deleted: true })
      return
    }

    if (method === 'PATCH' && !action) {
      const body = await readJsonBody(req)
      const updated = {
        ...current,
        candidateName: body.candidateName ?? current.candidateName,
        position: body.position ?? current.position,
        updatedAt: new Date().toISOString(),
      }
      interviews = interviews.map((item) => (item.id === id ? updated : item))
      json(res, 200, updated)
      return
    }
  }

  json(res, 404, {
    message: `Mock API has no handler for ${method} ${pathname}`,
    statusCode: 404,
  })
}

export function resetMockState() {
  interviews = createInitialInterviews()
}

export function startMockApi() {
  resetMockState()

  const server = createServer((req, res) => {
    void handleRequest(req, res)
  })

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[e2e-mock-api] listening on http://127.0.0.1:${PORT}`)
  })

  return server
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  startMockApi()
}
