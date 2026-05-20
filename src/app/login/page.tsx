'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { IconBadge } from '@/components/ui/icon-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DividerLabel } from '@/components/ui/divider-label'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Grid } from '@/components/ui/layout/grid'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { useAuth } from '@/lib/auth-context'
import { login } from '@/lib/api'
import { clearFieldError } from '@/lib/clear-field-error'
import { type FieldErrors, validateLogin } from '@/lib/form-validation'

type LoginField = 'email' | 'password'

export default function LoginPage() {
  const router = useRouter()
  const { establishSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginField>>({})
  const [authError, setAuthError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const errors = validateLogin({ email, password })
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setAuthError(null)
      return
    }

    const trimmedEmail = email.trim()
    setFieldErrors({})
    setAuthError(null)
    setLoading(true)

    try {
      const sessionUser = await login({ email: trimmedEmail, password })
      establishSession(sessionUser)
      router.push('/')
      router.refresh()
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell align="center">
      <Grid columns="login-shell" gap={8} align="center">
        <Stack as="section" gap={6}>
          <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
            Conductor AI
          </EyebrowBadge>

          <Stack gap={4}>
            <HeroTitle size="xl" width="prose">
              Review candidate performance with the calm of an editorial workspace.
            </HeroTitle>
            <HeroLead width="prose">
              The new design system trades brittle admin chrome for layered surfaces, sharper
              hierarchy, and faster decision-making during interview review.
            </HeroLead>
          </Stack>

          <Grid columns="metrics-3" gap={4}>
            <Card variant="surface" size="md">
              <CardContent spacing="sm">
                <IconBadge tone="primary" size="sm">
                  <ShieldCheck className="size-4" />
                </IconBadge>
                <Stack gap={1}>
                  <SectionHeading size="sm" as="h2">
                    Protected access
                  </SectionHeading>
                  <BodyText size="sm">
                    Session-based auth for recruiter-only workflows.
                  </BodyText>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="surface" size="md">
              <CardContent spacing="sm">
                <IconBadge tone="primary" size="sm">
                  <LockKeyhole className="size-4" />
                </IconBadge>
                <Stack gap={1}>
                  <SectionHeading size="sm" as="h2">
                    Unified shell
                  </SectionHeading>
                  <BodyText size="sm">
                    Shared tokens across dashboard, library, and interview flows.
                  </BodyText>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="surface" size="md">
              <CardContent spacing="sm">
                <IconBadge tone="primary" size="sm">
                  <ArrowRight className="size-4" />
                </IconBadge>
                <Stack gap={1}>
                  <SectionHeading size="sm" as="h2">
                    Fast triage
                  </SectionHeading>
                  <BodyText size="sm">
                    Move from sign-in straight into active interviews and scorecards.
                  </BodyText>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Stack>

        <Card variant="floating" size="lg" effects="blur-strong">
          <CardHeader spacing="sm">
            <EyebrowBadge size="sm">Recruiter access</EyebrowBadge>
            <CardTitle size="xl">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate>
              <Stack gap={6}>
              <Stack gap={4}>
                <FormField htmlFor="email" label="Email" error={fieldErrors.email}>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      clearFieldError('email', setFieldErrors)
                      setAuthError(null)
                    }}
                    placeholder="admin@interview-app.com"
                  />
                </FormField>

                <FormField htmlFor="password" label="Password" error={fieldErrors.password}>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearFieldError('password', setFieldErrors)
                      setAuthError(null)
                    }}
                    placeholder="Password"
                  />
                </FormField>
              </Stack>

              {authError ? (
                <Alert variant="danger">
                  <AlertTitle>Sign in failed</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="submit"
                variant="gradient"
                size="xl"
                width="full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <DividerLabel>Or</DividerLabel>

                <Button asChild variant="outline-pill" size="xl" width="full">
                  <a href="/api/auth/google">Sign in with Google</a>
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </PageShell>
  )
}
