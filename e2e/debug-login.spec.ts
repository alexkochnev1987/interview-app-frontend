import { expect, test } from '@playwright/test'

test('debug demo login cookies', async ({ page }) => {
  const responses: string[] = []
  const consoleMessages: string[] = []
  page.on('console', (msg) => consoleMessages.push(`${msg.type()}: ${msg.text()}`))
  page.on('pageerror', (err) => consoleMessages.push(`pageerror: ${err.message}`))
  page.on('response', async (response) => {
    if (response.url().includes('/api/auth/')) {
      const headers = response.headers()
      responses.push(
        `${response.request().method()} ${response.url()} -> ${response.status()} set-cookie=${headers['set-cookie'] ?? 'none'}`,
      )
    }
  })

  await page.goto('/login')
  await page.getByTestId('login-email').fill('admin@interview-app.com')
  await page.getByTestId('login-password').fill('admin123')
  await page.getByTestId('login-submit').click()
  await page.waitForTimeout(3000)

  const cookies = await page.context().cookies()
  const errorText = await page.locator('[role="alert"]').allTextContents()
  console.log('responses', responses)
  console.log('cookies', cookies)
  console.log('url', page.url())
  console.log('alerts', errorText)
  console.log('console', consoleMessages.slice(-20))

  await expect(page).not.toHaveURL(/\/login/)
})
