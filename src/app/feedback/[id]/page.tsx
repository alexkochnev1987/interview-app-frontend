import { unstable_noStore as noStore } from 'next/cache'

import { FeedbackView } from '@/components/feedback/feedback-view'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { type FeedbackResponse } from '@/lib/api'
import { getServerRequestContext, requestServer } from '@/lib/server-fetch'
import { readSearchParamToken } from '@/lib/text'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

const FEEDBACK_GATE = TOAST_MESSAGES.pageGate.feedback

interface FeedbackPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function FeedbackPage({
  params,
  searchParams,
}: FeedbackPageProps) {
  noStore()

  const { id } = await params
  const token = readSearchParamToken((await searchParams).token)

  const ctx = await getServerRequestContext()
  const encodedId = encodeURIComponent(id)

  let feedback: FeedbackResponse | null = null
  let error: string | null = null

  try {
    feedback =
      (await requestServer<FeedbackResponse>(`/feedback/${encodedId}`, ctx, {
        query: token ? { token } : undefined,
      })) ?? null
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : FEEDBACK_GATE.loadFailedFallback
  }

  if (error || !feedback) {
    return (
      <FlashErrorPageFallback
        title={FEEDBACK_GATE.unavailableTitle}
        description={error ?? FEEDBACK_GATE.loadFailedFallback}
      />
    )
  }

  return <FeedbackView feedback={feedback} />
}
