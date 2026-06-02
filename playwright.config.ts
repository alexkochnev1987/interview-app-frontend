import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

import { authStoragePath } from './e2e/support/constants'

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3001'

const browser = {
  ...devices['Desktop Chrome'],
  ...(process.env.CI ? {} : { channel: 'chrome' as const }),
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    ...browser,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        storageState: authStoragePath,
      },
      dependencies: ['setup'],
      testMatch: /recruiter-shell\.spec\.ts/,
    },
    {
      name: 'chromium-guest',
      testMatch: /auth-gate\.spec\.ts/,
    },
  ],
  webServer: process.env.E2E_SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: 'node scripts/e2e-start-backend.mjs',
          url: 'http://localhost:3000/health',
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          cwd: path.resolve(__dirname),
        },
        {
          command: process.env.CI
            ? 'npm run build && npx next start -p 3001 --webpack'
            : 'npm run dev:server',
          url: `${baseURL}/login`,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          cwd: path.resolve(__dirname),
          env: {
            ...process.env,
            BACKEND_URL: process.env.BACKEND_URL ?? 'http://localhost:3000',
          },
        },
      ],
})
