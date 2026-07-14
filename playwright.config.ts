import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

const frontendPort = process.env.E2E_FRONTEND_PORT ?? '3001'
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${frontendPort}`
const mockApiPort = process.env.E2E_MOCK_API_PORT ?? '3000'
const mockApiUrl = `http://127.0.0.1:${mockApiPort}`
const backendUrl = process.env.BACKEND_URL ?? mockApiUrl

const browser = {
  ...devices['Desktop Chrome'],
  ...(process.env.CI ? {} : { channel: 'chrome' as const }),
}

const frontendServerCommand =
  process.env.E2E_PREBUILT === '1'
    ? 'node scripts/e2e-start-frontend.mjs'
    : process.env.CI
      ? 'npm run build && node scripts/e2e-start-frontend.mjs'
      : 'npm run dev:server'

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
          command: frontendServerCommand,
          url: `${baseURL}/login`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          cwd: path.resolve(__dirname),
          env: {
            ...process.env,
            NODE_ENV: 'production',
            BACKEND_URL: backendUrl,
            E2E_MOCK_API_PORT: mockApiPort,
            PORT: frontendPort,
            HOSTNAME: '0.0.0.0',
          },
        },
      ],
})
