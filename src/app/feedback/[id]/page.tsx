'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { BadgeCheck, ChartColumnBig, Clock3, Sparkles, Target } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { MetricPanel } from '@/components/app/metric-panel'
import { StatusPill } from '@/components/app/status-pill'
import { LoadingStateCard } from '@/components/app/state-card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Feedback {
  overallResult?: string
  overallScore?: number
  categoryScores?: Record<string, number>
  generalFeedback?: string
  improvements?: string
  position: string
  date: string
  expiresAt: string
}

function resultTone(result?: string) {
  switch (result?.toLowerCase()) {
    case 'pass':
    case 'passed':
    case 'strong_hire':
    case 'hire':
      return 'completed' as const
    case 'borderline':
      return 'processing' as const
    case 'fail':
    case 'failed':
    case 'no_hire':
      return 'failed' as const
    default:
      return 'neutral' as const
  }
}

export default function FeedbackPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const token = searchParams.get('token') || ''

  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/feedback/${id}?token=${token}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Invalid or expired feedback link')
        }
        return res.json()
      })
      .then((data) => setFeedback(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [id, token])

  if (error) {
    return (
      <main className="container py-12">
        <Alert variant="destructive" className="mx-auto max-w-4xl border-rose-200/70 bg-rose-50/85">
          <AlertTitle>Feedback unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    )
  }

  if (!feedback) {
    return (
      <main className="container py-12">
        <LoadingStateCard className="mx-auto max-w-4xl" label="Loading feedback..." />
      </main>
    )
  }

  return (
    <main className="container space-y-8 py-10 md:py-12">
      <section className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/65 bg-white/88 shadow-float">
          <CardContent className="space-y-6 px-8 py-8">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
              Interview feedback
            </EyebrowBadge>

            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                Your interview summary
              </h1>
              <p className="text-base leading-7 text-muted-foreground md:text-lg">
                This page shares the reviewed outcome for the <strong>{feedback.position}</strong>{' '}
                interview and highlights both strengths and next areas to improve.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {feedback.overallResult ? (
                <StatusPill tone={resultTone(feedback.overallResult)}>
                  {feedback.overallResult.replace('_', ' ')}
                </StatusPill>
              ) : null}
              <StatusPill tone="neutral">
                Reviewed {new Date(feedback.date).toLocaleDateString()}
              </StatusPill>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl tracking-[-0.03em]">Snapshot</CardTitle>
            <CardDescription className="text-sm leading-6">
              A compact overview of your current outcome and when this shared link expires.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <MetricPanel
              tone="elevated"
              icon={<BadgeCheck className="size-4" />}
              label="Overall score"
              value={feedback.overallScore ?? '--'}
              valueClassName="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[hsl(var(--primary))]"
            />
            <MetricPanel
              tone="elevated"
              icon={<Clock3 className="size-4" />}
              label="Link expiry"
              value={new Date(feedback.expiresAt).toLocaleDateString()}
              valueClassName="mt-3 text-sm leading-6 text-foreground"
            />
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {feedback.categoryScores ? (
          <Card className="border-white/65 bg-white/88 shadow-soft">
            <CardHeader>
              <EyebrowBadge icon={<ChartColumnBig className="size-3.5" />} tone="primary">
                Category scores
              </EyebrowBadge>
              <CardTitle className="text-2xl tracking-[-0.03em]">Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {Object.entries(feedback.categoryScores).map(([category, score]) => (
                <MetricPanel
                  key={category}
                  tone="surface"
                  label={category}
                  value={score}
                  valueClassName="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[hsl(var(--primary))]"
                  description="out of 100"
                />
              ))}
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-6">
          {feedback.generalFeedback ? (
            <Card className="border-white/65 bg-white/88 shadow-soft">
              <CardHeader>
                <EyebrowBadge icon={<BadgeCheck className="size-3.5" />}>
                  Feedback
                </EyebrowBadge>
                <CardTitle className="text-2xl tracking-[-0.03em]">What went well</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">{feedback.generalFeedback}</p>
              </CardContent>
            </Card>
          ) : null}

          {feedback.improvements ? (
            <Card className="border-white/65 bg-white/88 shadow-soft">
              <CardHeader>
                <EyebrowBadge icon={<Target className="size-3.5" />}>
                  Recommendations
                </EyebrowBadge>
                <CardTitle className="text-2xl tracking-[-0.03em]">What to improve next</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">{feedback.improvements}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </main>
  )
}
