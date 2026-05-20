import { LoginForm } from '@/components/login/login-form'
import { LoginMarketingPanel } from '@/components/login/login-marketing-panel'
import { Grid } from '@/components/ui/layout/grid'
import { PageShell } from '@/components/ui/layout/page-shell'

export default function LoginPage() {
  return (
    <PageShell align="center">
      <Grid columns="login-shell" gap={8} align="center">
        <LoginMarketingPanel />
          <LoginForm />
      </Grid>
    </PageShell>
  )
}
