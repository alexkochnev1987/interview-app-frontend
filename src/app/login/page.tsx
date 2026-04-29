'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/app/hero-text'
import { IconBadge } from '@/components/app/icon-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Invalid credentials')
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container grid min-h-[calc(100vh-6rem)] gap-8 py-10 lg:grid-cols-[1.1fr_420px] lg:items-center lg:py-14">
      <section className="space-y-6">
        <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
          Conductor AI
        </EyebrowBadge>

        <div className="space-y-4">
          <HeroTitle size="xl" width="prose">
            Review candidate performance with the calm of an editorial workspace.
          </HeroTitle>
          <HeroLead width="prose">
            The new design system trades brittle admin chrome for layered surfaces, sharper
            hierarchy, and faster decision-making during interview review.
          </HeroLead>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card variant="surface" size="md">
            <CardContent spacing="sm">
              <IconBadge tone="primary" size="sm">
                <ShieldCheck className="size-4" />
              </IconBadge>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-foreground">Protected access</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Session-based auth for recruiter-only workflows.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="surface" size="md">
            <CardContent spacing="sm">
              <IconBadge tone="primary" size="sm">
                <LockKeyhole className="size-4" />
              </IconBadge>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-foreground">Unified shell</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Shared tokens across dashboard, library, and interview flows.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="surface" size="md">
            <CardContent spacing="sm">
              <IconBadge tone="primary" size="sm">
                <ArrowRight className="size-4" />
              </IconBadge>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-foreground">Fast triage</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Move from sign-in straight into active interviews and scorecards.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card variant="floating" size="lg" effects="blur-strong">
        <CardHeader spacing="sm">
          <EyebrowBadge size="sm">
            Recruiter access
          </EyebrowBadge>
          <CardTitle size="xl">
            Sign in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <Alert variant="danger">
                <AlertTitle>Authentication failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@interview-app.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="xl"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs font-medium uppercase tracking-eyebrow-wide text-muted-foreground">
                Or
              </span>
            </div>

            <Button
              asChild
              variant="outline-pill"
              size="xl"
              className="w-full"
            >
              <a href="/api/auth/google">Sign in with Google</a>
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
