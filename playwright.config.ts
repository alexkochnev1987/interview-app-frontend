import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3001'

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
          command: 'node scripts/e2e-start-backend.mjs',
          url: 'http://localhost:3000/health',
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          cwd: path.resolve(__dirname),
        },
        {
          command: process.env.CI
            ? 'npm run build && npx next start -p 3001'
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
