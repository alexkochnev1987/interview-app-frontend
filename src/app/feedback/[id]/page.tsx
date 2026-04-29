'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { BadgeCheck, ChartColumnBig, Clock3, Sparkles, Target } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/app/hero-text'
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
        <Alert variant="danger" className="mx-auto max-w-4xl">
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
        <Card variant="floating" size="lg">
          <CardContent spacing="xl">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
              Interview feedback
            </EyebrowBadge>

            <div className="space-y-3">
              <HeroTitle>Your interview summary</HeroTitle>
              <HeroLead>
                This page shares the reviewed outcome for the <strong>{feedback.position}</strong>{' '}
                interview and highlights both strengths and next areas to improve.
              </HeroLead>
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

        <Card variant="tinted">
          <CardHeader>
            <CardTitle size="lg">Snapshot</CardTitle>
            <CardDescription>
              A compact overview of your current outcome and when this shared link expires.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricPanel
                tone="elevated"
                icon={<BadgeCheck className="size-4" />}
                label="Overall score"
                value={feedback.overallScore ?? '--'}
                valueTone="primary"
              />
              <MetricPanel
                tone="elevated"
                icon={<Clock3 className="size-4" />}
                label="Link expiry"
                value={new Date(feedback.expiresAt).toLocaleDateString()}
                valueSize="sm"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {feedback.categoryScores ? (
          <Card variant="surface">
            <CardHeader>
              <EyebrowBadge icon={<ChartColumnBig className="size-3.5" />} tone="primary">
                Category scores
              </EyebrowBadge>
              <CardTitle size="lg">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(feedback.categoryScores).map(([category, score]) => (
                  <MetricPanel
                    key={category}
                    tone="surface"
                    label={category}
                    value={score}
                    valueSize="hero"
                    valueTone="primary"
                    description="out of 100"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-6">
          {feedback.generalFeedback ? (
            <Card variant="surface">
              <CardHeader>
                <EyebrowBadge icon={<BadgeCheck className="size-3.5" />}>
                  Feedback
                </EyebrowBadge>
                <CardTitle size="lg">What went well</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">{feedback.generalFeedback}</p>
              </CardContent>
            </Card>
          ) : null}

          {feedback.improvements ? (
            <Card variant="surface">
              <CardHeader>
                <EyebrowBadge icon={<Target className="size-3.5" />}>
                  Recommendations
                </EyebrowBadge>
                <CardTitle size="lg">What to improve next</CardTitle>
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
