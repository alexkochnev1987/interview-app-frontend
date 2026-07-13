import { expect, type Page } from '@playwright/test'

const E2E_ADMIN = {
  email: 'admin@interview-app.com',
  password: 'admin123',
} as const

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByTestId('login-email').fill(E2E_ADMIN.email)
  await page.getByTestId('login-password').fill(E2E_ADMIN.password)
  await page.getByTestId('login-submit').click()
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 })
}
