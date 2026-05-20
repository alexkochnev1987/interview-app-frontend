import { Suspense } from 'react'

import { LoginForm } from '@/components/login/login-form'
import { LoginMarketingPanel } from '@/components/login/login-marketing-panel'
import { Grid } from '@/components/ui/layout/grid'
import { PageShell } from '@/components/ui/layout/page-shell'
import { LoadingStateCard } from '@/components/ui/state-card'

export default function LoginPage() {
  return (
    <PageShell align="center">
      <Grid columns="login-shell" gap={8} align="center">
        <LoginMarketingPanel />
        <Suspense
          fallback={
            <LoadingStateCard label="Loading sign in..." />
          }
        >
          <LoginForm />
        </Suspense>
      </Grid>
    </PageShell>
  )
}
