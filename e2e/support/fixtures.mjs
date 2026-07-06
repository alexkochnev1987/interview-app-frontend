const ISO = '2026-01-01T00:00:00.000Z'

export const E2E_SESSION_TOKEN = 'e2e-session'
export const E2E_ADMIN = {
  email: 'admin@interview-app.com',
  password: 'admin123',
}

export const ELIGIBLE_QUESTION_TEXT = 'Eligible interview question'
export const SCHEDULED_QUESTION_TEXT = 'Scheduled deletion question'

export function authUser(overrides = {}) {
  return {
    id: 'e2e-admin',
    email: E2E_ADMIN.email,
    name: 'E2E Admin',
    role: 'admin',
    organizationId: 'org-e2e',
    createdAt: ISO,
    ...overrides,
  }
}

export function question(overrides = {}) {
  return {
    id: 'q-default',
    outputLanguage: 'en',
    questionText: 'Default question',
    followUpQuestions: [],
    expectedConcepts: [],
    redFlags: [],
    difficulty: 'medium',
    weight: 1,
    minimumPassScore: 50,
    tags: [],
    metadata: {},
    createdAt: ISO,
    updatedAt: ISO,
    deleted: false,
    pendingDeletion: false,
    usageCount: 0,
    ...overrides,
  }
}

export const MOCK_QUESTIONS = [
  question({
    id: 'q-eligible',
    questionText: ELIGIBLE_QUESTION_TEXT,
  }),
  question({
    id: 'q-scheduled',
    questionText: SCHEDULED_QUESTION_TEXT,
    pendingDeletion: true,
  }),
]

export function interview(overrides = {}) {
  return {
    id: 'iv-default',
    candidateName: 'Alex Candidate',
    position: 'Frontend Engineer',
    questions: [MOCK_QUESTIONS[0]],
    answers: [],
    status: 'pending',
    createdAt: ISO,
    updatedAt: ISO,
    ...overrides,
  }
}

export function createInitialInterviews() {
  return [
    interview({
      id: 'iv-pending',
      candidateName: 'Pending Candidate',
      status: 'pending',
    }),
    interview({
      id: 'iv-in-progress',
      candidateName: 'Active Candidate',
      status: 'in_progress',
    }),
  ]
}

export const EMPTY_QUESTION_FACETS = {
  difficulties: [],
  categories: [],
  subcategories: [],
  roles: [],
  tags: [],
}

export const EMPTY_INTERVIEW_FACETS = {
  positions: [],
  statuses: [],
}

export function toInterviewListItem(item) {
  const submittedAnswerCount = item.answers.filter(
    (answer) => answer.status === 'submitted',
  ).length

  return {
    id: item.id,
    candidateName: item.candidateName,
    position: item.position,
    status: item.status,
    questionCount: item.questions.length,
    submittedAnswerCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export function buildInterviewFacets(items) {
  const positions = new Map()
  const statuses = new Map()

  for (const item of items) {
    positions.set(item.position, (positions.get(item.position) ?? 0) + 1)
    statuses.set(item.status, (statuses.get(item.status) ?? 0) + 1)
  }

  return {
    positions: [...positions.entries()].map(([value, count]) => ({ value, count })),
    statuses: [...statuses.entries()].map(([value, count]) => ({ value, count })),
  }
}
