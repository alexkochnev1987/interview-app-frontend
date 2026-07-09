import { expect, test } from '@playwright/test'

test('try-the-demo signs in read-only and shows the demo banner', async ({ page }) => {
  await page.goto('/login')

  const tryDemo = page.getByTestId('login-demo')
  await expect(tryDemo).toBeVisible()
  await tryDemo.click()

  // Lands on the authenticated app (not back on /login)...
  await expect(page).not.toHaveURL(/\/login(\?|$)/)
  // ...and the read-only demo banner is shown.
  await expect(page.getByTestId('demo-mode-banner')).toBeVisible()
  await expect(page.getByText(/read-only demo/i)).toBeVisible()
})
