export const E2E_MOCK_API_PORT = process.env.E2E_MOCK_API_PORT ?? '13000'
export const E2E_FRONTEND_PORT = process.env.E2E_FRONTEND_PORT ?? '13001'

export const E2E_MOCK_API_URL = `http://localhost:${E2E_MOCK_API_PORT}`
export const E2E_FRONTEND_URL =
  process.env.E2E_BASE_URL ?? `http://localhost:${E2E_FRONTEND_PORT}`
