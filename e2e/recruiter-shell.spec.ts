import { expect, test } from '@playwright/test'

import { e2eTestIds } from './support/test-ids'

test('loads core recruiter pages', async ({ page }) => {
  await page.goto('/questions')
  await expect(page).toHaveURL(/\/questions/)
  await expect(page.getByTestId(e2eTestIds.questionsPage)).toBeVisible()

  await page.goto('/interviews/new')
  await expect(page).toHaveURL(/\/interviews\/new/)
  await expect(page.getByTestId(e2eTestIds.interviewCreatePage)).toBeVisible()
})
