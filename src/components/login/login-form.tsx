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
import { login } from '@/lib/api'
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
  const [loading, setLoading] = useState(false)

  const redirectPath = stripLocalePrefix(safeRedirectPath(searchParams.get('from')))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const sessionUser = await login({ email, password })
      establishSession(sessionUser)
      router.push(redirectPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : toastMessages.pageGate.login.failedFallback)
    } finally {
      setLoading(false)
    }
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
                />
              </FormField>
            </Stack>

            <Button
              type="submit"
              variant="gradient"
              size="xl"
              width="full"
              disabled={loading}
              data-testid="login-submit"
            >
              {loading
                ? toastMessages.pageGate.login.signingInLabel
                : toastMessages.pageGate.login.signInLabel}
            </Button>

            <DividerLabel>{t('or')}</DividerLabel>

            <Button asChild variant="outline-pill" size="xl" width="full">
              <Link href="/api/auth/google" prefetch={false}>
                {t('google')}
              </Link>
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}
