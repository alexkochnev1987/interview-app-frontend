import { expect, test } from '@playwright/test'

import { loginAsAdmin } from './support/auth'
import {
  ELIGIBLE_QUESTION_TEXT,
  SCHEDULED_QUESTION_TEXT,
} from './support/fixtures.mjs'

const MOCK_API_BASE =
  process.env.BACKEND_URL ??
  `http://localhost:${process.env.E2E_MOCK_API_PORT ?? '3000'}`

test.describe('interview management', () => {
  test.beforeEach(async ({ request }) => {
    await request.post(`${MOCK_API_BASE}/__e2e__/reset`)
  })

  test('create picker hides scheduled-deletion questions', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/interviews/new')

    await expect(page.getByText(ELIGIBLE_QUESTION_TEXT)).toBeVisible()
    await expect(page.getByText(SCHEDULED_QUESTION_TEXT)).toHaveCount(0)
  })

  test('create picker client refetch sends eligibleForInterview', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/interviews/new')
    await expect(page.getByText(ELIGIBLE_QUESTION_TEXT)).toBeVisible()

    const eligibleRequest = page.waitForRequest(
      (request) =>
        request.method() === 'GET' &&
        request.url().includes('/api/questions') &&
        !request.url().includes('/facets') &&
        request.url().includes('eligibleForInterview=true'),
    )

    await page
      .getByRole('searchbox', { name: 'Search by prompt, role, category, or tag' })
      .fill('Eligible')
    await eligibleRequest
  })

  test('pending interview exposes edit and cancel actions', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/interviews/iv-pending')

    await expect(page.getByRole('heading', { name: 'Pending Candidate' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Edit interview' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel interview' })).toBeVisible()
  })

  test('canceling a pending interview returns to the dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/interviews/iv-pending')

    await expect(page.getByRole('heading', { name: 'Pending Candidate' })).toBeVisible()
    await page.getByRole('button', { name: 'Cancel interview' }).click()
    await expect(page.getByRole('dialog')).toContainText('Cancel this interview?')

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Cancel interview' })
      .click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Recruiter Dashboard')).toBeVisible()
  })

  test('in-progress interview hides management actions', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/interviews/iv-in-progress')

    await expect(page.getByRole('heading', { name: 'Active Candidate' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Edit interview' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Cancel interview' })).toHaveCount(0)
  })
})
