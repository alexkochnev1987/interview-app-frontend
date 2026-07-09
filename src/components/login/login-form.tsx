'use client'

import { type FormEvent, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DividerLabel } from '@/components/ui/divider-label'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/layout/stack'
import { useRouter } from '@/i18n/navigation'
import { stripLocalePrefix } from '@/i18n/pathname'
import { demoLogin, login } from '@/lib/api'
import { ApiError } from '@/lib/api-error'
import { useAuth } from '@/lib/auth-context'
import { safeRedirectPath } from '@/lib/safe-redirect-path'
import { useToastMessages } from '@/lib/use-toast-messages'

export function LoginForm() {
  const t = useTranslations('login.form')
  const toastMessages = useToastMessages()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { establishSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState<'login' | 'demo' | null>(null)
  const pending = pendingAction !== null

  const redirectPath = stripLocalePrefix(safeRedirectPath(searchParams.get('from')))

  async function runAuth(
    action: 'login' | 'demo',
    authCall: () => Promise<Awaited<ReturnType<typeof login>>>,
  ) {
    setError('')
    setPendingAction(action)

    try {
      const sessionUser = await authCall()
      establishSession(sessionUser)
      router.replace(redirectPath)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR') {
        setError(toastMessages.pageGate.login.failedFallback)
        return
      }
      setError(
        toastMessages.apiError.message(err) ?? toastMessages.pageGate.login.failedFallback,
      )
    } finally {
      setPendingAction(null)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await runAuth('login', () => login({ email, password }))
  }

  async function handleDemo() {
    await runAuth('demo', () => demoLogin())
  }

  return (
    <Card variant="floating" size="lg" effects="blur-strong">
      <CardHeader spacing="sm">
        <EyebrowBadge size="sm">{t('eyebrow')}</EyebrowBadge>
        <CardTitle size="xl">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            {error ? (
              <Alert variant="danger">
                <AlertTitle>{toastMessages.pageGate.login.failedTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Stack gap={4}>
              <FormField htmlFor="email" label={t('emailLabel')}>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                  required
                  data-testid="login-email"
                />
              </FormField>

              <FormField htmlFor="password" label={t('passwordLabel')}>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  autoComplete="current-password"
                  required
                  data-testid="login-password"
                />
              </FormField>
            </Stack>

            <Button
              type="submit"
              variant="gradient"
              size="xl"
              width="full"
              disabled={pending}
              data-testid="login-submit"
            >
              {pendingAction === 'login'
                ? toastMessages.pageGate.login.signingInLabel
                : toastMessages.pageGate.login.signInLabel}
            </Button>

            <DividerLabel>{t('or')}</DividerLabel>

            <Button asChild variant="outline-pill" size="xl" width="full">
              <Link href="/api/auth/google" prefetch={false}>
                {t('google')}
              </Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="xl"
              width="full"
              onClick={handleDemo}
              disabled={pending}
              data-testid="login-demo"
            >
              {pendingAction === 'demo'
                ? toastMessages.pageGate.login.signingInLabel
                : t('demo')}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}
