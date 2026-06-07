import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3001'
const mockApiPort = process.env.E2E_MOCK_API_PORT ?? '3000'
const mockApiUrl = `http://localhost:${mockApiPort}`
const backendUrl = process.env.BACKEND_URL ?? mockApiUrl

const browser = {
  ...devices['Desktop Chrome'],
  ...(process.env.CI ? {} : { channel: 'chrome' as const }),
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    ...browser,
  },
  webServer: process.env.E2E_SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: 'node scripts/e2e-start-mock-api.mjs',
          url: `${mockApiUrl}/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
          cwd: path.resolve(__dirname),
          env: {
            ...process.env,
            E2E_MOCK_API_PORT: mockApiPort,
          },
        },
        {
          command: process.env.CI
            ? 'npm run build && npx next start -p 3001'
            : 'npm run dev:server',
          url: `${baseURL}/login`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          cwd: path.resolve(__dirname),
          env: {
            ...process.env,
            BACKEND_URL: backendUrl,
            E2E_MOCK_API_PORT: mockApiPort,
          },
        },
      ],
})
