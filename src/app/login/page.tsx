'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { LoginFeatureCard } from '@/components/login/login-feature-card'
import { SurfaceCard } from '@/components/app/surface-card'
import { CardContentForm, CardHeaderForm, HeroDescription } from '@/components/layout/content-presets'
import { LoginFeatureGrid } from '@/components/layout/grid-layouts'
import { LoginPageShell } from '@/components/layout/page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
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
    <LoginPageShell>
      <section className="space-y-6">
        <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
          Conductor AI
        </EyebrowBadge>

        <div className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-foreground md:text-6xl">
            Review candidate performance with the calm of an editorial workspace.
          </h1>
          <HeroDescription>
            The new design system trades brittle admin chrome for layered surfaces, sharper
            hierarchy, and faster decision-making during interview review.
          </HeroDescription>
        </div>

        <LoginFeatureGrid>
          <LoginFeatureCard
            icon={<ShieldCheck className="size-4" />}
            title="Protected access"
            description="Session-based auth for recruiter-only workflows."
          />
          <LoginFeatureCard
            icon={<LockKeyhole className="size-4" />}
            title="Unified shell"
            description="Shared tokens across dashboard, library, and interview flows."
          />
          <LoginFeatureCard
            icon={<ArrowRight className="size-4" />}
            title="Fast triage"
            description="Move from sign-in straight into active interviews and scorecards."
          />
        </LoginFeatureGrid>
      </section>

      <SurfaceCard tone="glassFloat">
        <CardHeaderForm>
          <EyebrowBadge size="sm">
            Recruiter access
          </EyebrowBadge>
          <CardTitle className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
            Sign in
          </CardTitle>
        </CardHeaderForm>
        <CardContentForm>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <Alert variant="destructive">
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
                  className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
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
                  className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="gradient"
              size="full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Or
              </span>
            </div>

            <Button
              asChild
              variant="outline-soft-strong"
              size="full"
            >
              <a href="/api/auth/google">Sign in with Google</a>
            </Button>
          </form>
        </CardContentForm>
      </SurfaceCard>
    </LoginPageShell>
  )
}
