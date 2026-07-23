import { getTranslations } from 'next-intl/server'

import { CandidateFeedbackShareView } from '@/components/feedback/candidate-feedback-share-view'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import type { Locale } from '@/i18n/locales'
import {
  getSharedCandidateFeedback,
  type PublicCandidateFeedbackResponse,
} from '@/lib/api'
import { getServerRequestContext } from '@/lib/server-fetch'

interface CandidateFeedbackSharePageProps {
  params: Promise<{ token: string; locale: Locale }>
}

export default async function CandidateFeedbackSharePage({
  params,
}: CandidateFeedbackSharePageProps) {
  const { token, locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'toast.pageGate.feedbackShare',
  })
  const ctx = await getServerRequestContext(locale)

  let feedback: PublicCandidateFeedbackResponse | null = null
  let error: string | null = null

  try {
    feedback = await getSharedCandidateFeedback(token, ctx)
  } catch (err) {
    error = err instanceof Error ? err.message : t('loadFailedFallback')
  }

  if (error || !feedback) {
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={error ?? t('loadFailedFallback')}
        showAction={false}
      />
    )
  }

  // Preset outcome copy is candidate-facing content and must match interviewLocale,
  // even when the share chrome stays in the UI locale.
  const tShareOutcome = await getTranslations({
    locale: feedback.interviewLocale,
    namespace: 'feedback.share',
  })
  const outcomeMessage =
    feedback.outcome === 'custom'
      ? (feedback.outcomeMessage?.trim() ?? '')
      : feedback.outcome === 'next_stage' || feedback.outcome === 'keep_in_touch'
        ? tShareOutcome(`outcome.${feedback.outcome}`)
        : ''

  return (
    <CandidateFeedbackShareView
      feedback={feedback}
      outcomeMessage={outcomeMessage}
    />
  )
}
