import { expect, type Page } from '@playwright/test'

import { e2eCredentials } from './constants'

export async function signIn(page: Page) {
  const { email, password } = e2eCredentials()

  await page.goto('/login')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page).toHaveURL(/\/(\?.*)?$/)
}
