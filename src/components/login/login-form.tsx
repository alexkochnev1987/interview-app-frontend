'use client'

import { type FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DividerLabel } from '@/components/ui/divider-label'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/layout/stack'
import { login } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { safeRedirectPath } from '@/lib/safe-redirect-path'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

const LOGIN_MESSAGES = TOAST_MESSAGES.pageGate.login

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { establishSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectPath = safeRedirectPath(searchParams.get('from'))

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
      setError(err instanceof Error ? err.message : LOGIN_MESSAGES.failedFallback)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card variant="floating" size="lg" effects="blur-strong">
      <CardHeader spacing="sm">
        <EyebrowBadge size="sm">Recruiter access</EyebrowBadge>
        <CardTitle size="xl">Sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            {error ? (
              <Alert variant="danger">
                <AlertTitle>{LOGIN_MESSAGES.failedTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Stack gap={4}>
              <FormField htmlFor="email" label="Email">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@interview-app.com"
                  autoComplete="email"
                  required
                />
              </FormField>

              <FormField htmlFor="password" label="Password">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
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
            >
              {loading ? LOGIN_MESSAGES.signingInLabel : LOGIN_MESSAGES.signInLabel}
            </Button>

            <DividerLabel>Or</DividerLabel>

            <Button asChild variant="outline-pill" size="xl" width="full">
              <a href="/api/auth/google">Sign in with Google</a>
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}
