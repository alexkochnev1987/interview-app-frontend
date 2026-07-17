'use client'

import { useTranslations } from 'next-intl'

import { StatusPill, type StatusTone } from '@/components/ui/status-pill'
import {
  isCandidateFeedbackSkippedFailureBlock,
  type CandidateFeedbackBlock,
  type CandidateFeedbackBlockState,
} from '@/lib/candidate-feedback'

export function blockStateTone(
  state: CandidateFeedbackBlockState,
  skippedFailure = false,
): StatusTone {
  if (skippedFailure) {
    return 'pending'
  }

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
  block: Pick<CandidateFeedbackBlock, 'state' | 'errorMessage'>
}

export function CandidateFeedbackBlockStatePill({
  block,
}: CandidateFeedbackBlockStatePillProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const skippedFailure = isCandidateFeedbackSkippedFailureBlock(block)
  const labelKey = skippedFailure ? 'skipped' : block.state

  return (
    <StatusPill tone={blockStateTone(block.state, skippedFailure)} casing="chip">
      {t(`blockState.${labelKey}`)}
    </StatusPill>
  )
}
