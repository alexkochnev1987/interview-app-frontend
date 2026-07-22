import { expect, test } from '@playwright/test'

import { loginAsAdmin } from './support/auth'
import {
  ELIGIBLE_QUESTION_TEXT,
  SCHEDULED_QUESTION_TEXT,
} from './support/fixtures.mjs'

const MOCK_API_BASE =
  process.env.BACKEND_URL ??
  `http://127.0.0.1:${process.env.E2E_MOCK_API_PORT ?? '3000'}`

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
    await expect(page.getByRole('button', { name: 'Delete interview' })).toHaveCount(0)
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

  test('in-progress interview exposes HR-only edit for admins', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/interviews/iv-in-progress')

    await expect(page.getByRole('heading', { name: 'Active Candidate' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Edit interview' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel interview' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Delete interview' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Edit interview' }).click()
    await expect(
      page.getByText(
        'Candidate details and questions cannot be changed in this state. You can update the assigned HR reviewer.',
      ),
    ).toBeVisible()
    await expect(page.getByLabel('Assigned HR reviewer')).toBeVisible()
    await expect(page.getByLabel('Candidate name')).toHaveCount(0)
  })

  test('completed interview exposes delete action', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/interviews/iv-completed')

    await expect(page.getByRole('heading', { name: 'Completed Candidate' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete interview' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel interview' })).toHaveCount(0)
  })

  test('failed interview exposes delete action', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/interviews/iv-failed')

    await expect(page.getByRole('heading', { name: 'Failed Candidate' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete interview' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel interview' })).toHaveCount(0)
  })

  test('deleting a completed interview returns to the dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/interviews/iv-completed')

    await expect(page.getByRole('heading', { name: 'Completed Candidate' })).toBeVisible()
    await page.getByRole('button', { name: 'Delete interview' }).click()
    await expect(page.getByRole('dialog')).toContainText('Delete this interview?')

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete interview' })
      .click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Recruiter Dashboard')).toBeVisible()
  })

  test('demo user sees a disabled delete button on completed interviews', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.getByTestId('login-demo').click()
    await expect(page).not.toHaveURL(/\/login(\?|$)/, { timeout: 15_000 })

    await page.goto('/interviews/iv-completed')
    await expect(page.getByRole('heading', { name: 'Completed Candidate' })).toBeVisible()

    const deleteButton = page.getByRole('button', { name: 'Delete interview' })
    await expect(deleteButton).toBeVisible()
    await expect(deleteButton).toBeDisabled()
  })
})
