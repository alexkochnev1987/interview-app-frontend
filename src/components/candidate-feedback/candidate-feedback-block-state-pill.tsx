'use client'

import { useTranslations } from 'next-intl'

import { StatusPill, type StatusTone } from '@/components/ui/status-pill'
import { type CandidateFeedbackBlockState } from '@/lib/candidate-feedback'

export function blockStateTone(state: CandidateFeedbackBlockState): StatusTone {
  switch (state) {
    case 'generating':
      return 'processing'
    case 'generated':
      return 'pending'
    case 'accepted':
      return 'completed'
    case 'edited':
      return 'primary'
    case 'failed':
      return 'failed'
  }

  return 'neutral'
}

interface CandidateFeedbackBlockStatePillProps {
  state: CandidateFeedbackBlockState
}

export function CandidateFeedbackBlockStatePill({
  state,
}: CandidateFeedbackBlockStatePillProps) {
  const t = useTranslations('interviews.candidateFeedback')

  return (
    <StatusPill tone={blockStateTone(state)} casing="chip">
      {t(`blockState.${state}`)}
    </StatusPill>
  )
}
