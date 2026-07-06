import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

import {
  E2E_FRONTEND_PORT,
  E2E_FRONTEND_URL,
  E2E_MOCK_API_PORT,
  E2E_MOCK_API_URL,
} from './e2e/support/ports.mjs'

const browser = {
  ...devices['Desktop Chrome'],
  ...(process.env.CI ? {} : { channel: 'chrome' as const }),
}

const frontendServerCommand =
  process.env.E2E_PREBUILT === '1'
    ? `npx next start -p ${E2E_FRONTEND_PORT}`
    : process.env.CI
      ? `npm run build && npx next start -p ${E2E_FRONTEND_PORT}`
      : `npx next dev -p ${E2E_FRONTEND_PORT} --webpack`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: E2E_FRONTEND_URL,
    trace: 'retain-on-failure',
    ...browser,
  },
  webServer: process.env.E2E_SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: 'node scripts/e2e-start-mock-api.mjs',
          url: `${E2E_MOCK_API_URL}/health`,
          reuseExistingServer: false,
          timeout: 60_000,
          cwd: path.resolve(__dirname),
          env: {
            ...process.env,
            E2E_MOCK_API_PORT,
          },
        },
        {
          command: frontendServerCommand,
          url: `${E2E_FRONTEND_URL}/login`,
          reuseExistingServer: false,
          timeout: 120_000,
          cwd: path.resolve(__dirname),
          env: {
            ...process.env,
            BACKEND_URL: E2E_MOCK_API_URL,
            E2E_MOCK_API_PORT,
          },
        },
      ],
})
