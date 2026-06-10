import { expect, test } from '@playwright/test'

test('redirects protected routes to login', async ({ page }) => {
  await page.goto('/questions')

  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByTestId('login-email')).toBeVisible()
})
