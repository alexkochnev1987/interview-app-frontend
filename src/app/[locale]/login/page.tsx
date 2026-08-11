import { Suspense } from 'react'

import { LoginForm } from '@/components/login/login-form'
import { LoginHeader } from '@/components/login/login-header'
import { LoginMarketingPanel } from '@/components/login/login-marketing-panel'
import { Grid } from '@/components/ui/layout/grid'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'

export default function LoginPage() {
  return (
    <PageShell align="top">
      <Stack gap={8} height="full">
        <Suspense fallback={null}>
          <LoginHeader />
        </Suspense>
        <Stack grow="fill" justify="center">
          <Grid columns="login-shell" gap={8} align="center">
            <Suspense fallback={null}>
              <LoginMarketingPanel />
            </Suspense>
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </Grid>
        </Stack>
      </Stack>
    </PageShell>
  )
}
