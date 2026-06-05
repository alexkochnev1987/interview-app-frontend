import { expect, test } from '@playwright/test'

import { e2eTestIds } from './support/test-ids'

test('redirects protected routes to login', async ({ page }) => {
  await page.goto('/questions')

  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByTestId(e2eTestIds.loginEmail)).toBeVisible()
})
