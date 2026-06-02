import { expect, type Page } from '@playwright/test'

import { e2eCredentials } from './constants'
import { e2eTestIds } from './test-ids'

const authenticatedRoutePattern =
  /^\/(?:$|questions(?:\/|$)|interviews(?:\/|$)|assessments(?:\/|$)|team(?:\/|$))/

export async function signIn(page: Page) {
  const { email, password } = e2eCredentials()

  await page.goto('/login')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByTestId(e2eTestIds.loginSubmit).click()
  await expect(page).not.toHaveURL(/\/login/)
  await expect(page).toHaveURL(authenticatedRoutePattern)
}
