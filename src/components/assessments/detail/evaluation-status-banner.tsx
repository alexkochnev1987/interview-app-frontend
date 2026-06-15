'use client'

import { ShieldAlert, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Icon } from '@/components/ui/icon'
import { type Interview } from '@/lib/api'
import { deriveAnswerState } from '@/lib/assessment-status'

interface EvaluationStatusBannerProps {
  interview: Interview
}

interface Counts {
  total: number
  scored: number
  scoring: number
  failed: number
  awaiting: number
}

function countAnswers(interview: Interview): Counts {
  const submitted = interview.answers.filter((a) => a.status === 'submitted')
  const counts: Counts = {
    total: submitted.length,
    scored: 0,
    scoring: 0,
    failed: 0,
    awaiting: 0,
  }
  for (const answer of submitted) {
    switch (deriveAnswerState(answer)) {
      case 'scored':
        counts.scored += 1
        break
      case 'scoring':
        counts.scoring += 1
        break
      case 'failed':
        counts.failed += 1
        break
      default:
        counts.awaiting += 1
    }
  }
  return counts
}

/**
 * Surfaces an attention-worthy scoring state (all failed, some failed, or
 * submitted-but-none-scored). It deliberately renders nothing for the happy and
 * in-flight cases, which are communicated elsewhere (status pill, live loop).
 */
export function EvaluationStatusBanner({
  interview,
}: EvaluationStatusBannerProps) {
  const t = useTranslations('assessments.banner')
  const counts = countAnswers(interview)

  if (counts.total === 0) return null
  if (counts.scoring > 0) return null
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
