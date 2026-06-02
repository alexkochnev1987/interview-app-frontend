import { expect, test } from '@playwright/test'

test('loads core recruiter pages', async ({ page }) => {
  await page.goto('/questions')
  await expect(
    page.getByRole('heading', {
      name: /Curate prompts with the same calm hierarchy as interview review/i,
    }),
  ).toBeVisible()

  await page.goto('/interviews/new')
  await expect(
    page.getByRole('heading', {
      name: /Assemble the candidate packet before you send the interview link/i,
    }),
  ).toBeVisible()
})
