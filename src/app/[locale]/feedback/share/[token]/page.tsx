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
    namespace: 'toast.pageGate.feedback',
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
      />
    )
  }

  return <CandidateFeedbackShareView feedback={feedback} />
}
