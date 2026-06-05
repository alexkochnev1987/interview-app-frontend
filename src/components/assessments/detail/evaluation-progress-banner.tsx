'use client'

import { ShieldAlert, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Icon } from '@/components/ui/icon'
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

export function EvaluationProgressBanner({
  interview,
}: EvaluationProgressBannerProps) {
  const t = useTranslations('assessments.banner')
  const counts = countAnswers(interview)
  const inFlight = counts.queued + counts.processing > 0

  if (counts.total === 0) return null
  if (inFlight) return null
  if (interview.status === 'failed') return null

  if (counts.failed > 0 && counts.scored === 0) {
    return (
      <Alert variant="danger">
        <Icon size="md">
          <ShieldAlert />
        </Icon>
        <AlertTitle>{t('allFailedTitle')}</AlertTitle>
        <AlertDescription>
          {t('allFailedDescription', { total: counts.total })}
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
        <AlertTitle>{t('someFailedTitle')}</AlertTitle>
        <AlertDescription>
          {t('someFailedDescription', {
            scored: counts.scored,
            total: counts.total,
            failed: counts.failed,
          })}
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
        <AlertTitle>{t('noneYetTitle')}</AlertTitle>
        <AlertDescription>
          {t('noneYetDescription', { total: counts.total })}
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
