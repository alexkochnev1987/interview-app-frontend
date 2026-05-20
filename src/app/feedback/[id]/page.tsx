import { unstable_noStore as noStore } from 'next/cache'

import { FeedbackView } from '@/components/feedback/feedback-view'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { type FeedbackResponse } from '@/lib/api'
import { getServerRequestContext, requestServer } from '@/lib/server-fetch'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

const FEEDBACK_GATE = TOAST_MESSAGES.pageGate.feedback

interface FeedbackPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string | string[] }>
}

function readToken(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0] ?? ''
  return ''
}

export default async function FeedbackPage({
  params,
  searchParams,
}: FeedbackPageProps) {
  noStore()

  const { id } = await params
  const token = readToken((await searchParams).token)

  const ctx = await getServerRequestContext()
  const encodedId = encodeURIComponent(id)
  const encodedToken = encodeURIComponent(token)

  let feedback: FeedbackResponse | null = null
  let error: string | null = null

  try {
    feedback =
      (await requestServer<FeedbackResponse>(
        `/feedback/${encodedId}?token=${encodedToken}`,
        ctx,
      )) ?? null
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
