import { test as setup } from '@playwright/test'

import { signIn } from './support/auth'
import { authStoragePath } from './support/constants'

setup('staff session', async ({ page }) => {
  await signIn(page)
  await page.context().storageState({ path: authStoragePath })
})
