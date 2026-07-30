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
        <LoginHeader />
        <Stack grow="fill" justify="center">
          <Grid columns="login-shell" gap={8} align="center">
            <LoginMarketingPanel />
            <LoginForm />
          </Grid>
        </Stack>
      </Stack>
    </PageShell>
  )
}
