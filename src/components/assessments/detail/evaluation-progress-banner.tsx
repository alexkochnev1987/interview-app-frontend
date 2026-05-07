'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, ShieldAlert, Sparkles } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { type Interview } from '@/lib/api'

interface EvaluationProgressBannerProps {
  interview: Interview
}

interface Counts {
  total: number
  scored: number
  queued: number
  processing: number
  failed: number
  awaiting: number
}

function countAnswers(interview: Interview): Counts {
  const submitted = interview.answers.filter((a) => a.status === 'submitted')
  let scored = 0
  let queued = 0
  let processing = 0
  let failed = 0
  let awaiting = 0
  for (const a of submitted) {
    if (a.validation?.status === 'queued') queued += 1
    else if (a.validation?.status === 'processing') processing += 1
    else if (a.validation?.status === 'failed') failed += 1
    else if (a.evaluation?.overallScore !== undefined) scored += 1
    else awaiting += 1
  }
  return { total: submitted.length, scored, queued, processing, failed, awaiting }
}

const REFRESH_INTERVAL_MS = 4000
const MAX_POLL_DURATION_MS = 3 * 60 * 1000

export function EvaluationProgressBanner({
  interview,
}: EvaluationProgressBannerProps) {
  const router = useRouter()
  const counts = countAnswers(interview)
  const inFlight = counts.queued + counts.processing > 0
  const [pollExpired, setPollExpired] = useState(false)

  useEffect(() => {
    if (!inFlight) {
      setPollExpired(false)
      return
    }
    if (pollExpired) return
    const startedAt = Date.now()
    const id = setInterval(() => {
      if (Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
        setPollExpired(true)
        clearInterval(id)
        return
      }
      router.refresh()
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [inFlight, pollExpired, router])

  if (counts.total === 0) return null

  if (inFlight && pollExpired) {
    return (
      <Alert variant="warning">
        <Icon size="md">
          <ShieldAlert />
        </Icon>
        <AlertTitle>Scoring is taking longer than usual</AlertTitle>
        <AlertDescription>
          <Inline gap={3} align="center" wrap="wrap">
            <span>
              {counts.queued + counts.processing} of {counts.total} answers are
              still being scored after several minutes. The worker may be stuck.
              Refresh manually to check, or re-run the affected answers.
            </span>
            <Button
              type="button"
              variant="outline-pill"
              shape="pill"
              size="sm"
              onClick={() => router.refresh()}
            >
              <Icon size="md">
                <RefreshCw />
              </Icon>
              Refresh now
            </Button>
          </Inline>
        </AlertDescription>
      </Alert>
    )
  }

  if (inFlight) {
    return null
  }

  if (interview.status === 'failed') {
    return null
  }

  if (counts.failed > 0 && counts.scored === 0) {
    return (
      <Alert variant="danger">
        <Icon size="md">
          <ShieldAlert />
        </Icon>
        <AlertTitle>AI scoring failed for every answer</AlertTitle>
        <AlertDescription>
          None of the {counts.total} submitted answers produced an evaluation.
          See the per-question error messages below for details, then re-run
          once the underlying issue is resolved.
        </AlertDescription>
      </Alert>
    )
  }

  if (counts.failed > 0) {
    return (
      <Alert variant="warning">
        <Icon size="md">
          <ShieldAlert />
        </Icon>
        <AlertTitle>Some answers failed to score</AlertTitle>
        <AlertDescription>
          {counts.scored} of {counts.total} scored, {counts.failed} failed. You
          can re-run the failed answers individually below.
        </AlertDescription>
      </Alert>
    )
  }

  if (counts.awaiting > 0 && counts.scored === 0) {
    return (
      <Alert variant="default">
        <Icon size="md">
          <Sparkles />
        </Icon>
        <AlertTitle>No AI evaluation has been run yet</AlertTitle>
        <AlertDescription>
          {counts.total} answers submitted, none evaluated. Click &quot;Re-run AI
          evaluation&quot; to start scoring.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
