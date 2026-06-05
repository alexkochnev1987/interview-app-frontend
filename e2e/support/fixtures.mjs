export const e2eCredentials = {
  email: process.env.E2E_EMAIL ?? 'admin@interview-app.com',
  password: process.env.E2E_PASSWORD ?? 'admin123',
}

/** @param {Record<string, unknown>} [overrides] */
export function createTestUser(overrides = {}) {
  return {
    id: 'e2e-user-1',
    email: e2eCredentials.email,
    name: 'E2E Admin',
    role: 'super_admin',
    organizationId: 'org_e2e',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
