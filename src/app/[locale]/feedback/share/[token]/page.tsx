import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { CandidateFeedbackShareView } from '@/components/feedback/candidate-feedback-share-view'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { getSharedCandidateFeedback } from '@/lib/api'
import { getServerRequestContext } from '@/lib/server-fetch'

interface CandidateFeedbackSharePageProps {
  params: Promise<{ token: string }>
}

async function CandidateFeedbackShareData({ params }: CandidateFeedbackSharePageProps) {
  const { token } = await params
  const ctx = await getServerRequestContext()
  const feedback = await getSharedCandidateFeedback(token, ctx)

  if (!feedback) {
    throw new Error('Shared feedback not found')
  }

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

  return <CandidateFeedbackShareView feedback={feedback} outcomeMessage={outcomeMessage} />
}

export default function CandidateFeedbackSharePage({ params }: CandidateFeedbackSharePageProps) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <CandidateFeedbackShareData params={params} />
    </Suspense>
  )
}
