import { useCallback } from 'react'

import { getCandidateFeedback } from '@/lib/api'
import {
  type CandidateFeedbackResponse,
  isCandidateFeedbackGenerating,
} from '@/lib/candidate-feedback'
import { useLivePolling } from '@/lib/use-live-polling'

export function useCandidateFeedbackData(
  interviewId: string,
  initialFeedback: CandidateFeedbackResponse,
) {
  const fetcher = useCallback(
    () => getCandidateFeedback(interviewId),
    [interviewId],
  )

  const { data, refresh, replaceData, kick, paused } = useLivePolling(
    initialFeedback,
    fetcher,
    isCandidateFeedbackGenerating,
  )

  return {
    feedback: data,
    refresh,
    replaceFeedback: replaceData,
    kick,
    paused,
  }
}
