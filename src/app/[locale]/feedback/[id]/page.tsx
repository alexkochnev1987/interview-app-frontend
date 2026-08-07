import { Suspense } from 'react'

import { FeedbackView } from '@/components/feedback/feedback-view'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { type FeedbackResponse } from '@/lib/api'
import { getServerRequestContext, requestServer } from '@/lib/server-fetch'
import { readSearchParamToken } from '@/lib/text'

interface FeedbackPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string | string[] }>
}

async function FeedbackData({ params, searchParams }: FeedbackPageProps) {
  const { id } = await params
  const token = readSearchParamToken((await searchParams).token)

  const ctx = await getServerRequestContext()
  const encodedId = encodeURIComponent(id)

  const feedback = await requestServer<FeedbackResponse>(`/feedback/${encodedId}`, ctx, {
    query: token ? { token } : undefined,
    withLocaleHeader: false,
  })

  if (!feedback) {
    throw new Error('Feedback not found')
  }

  return <FeedbackView feedback={feedback} />
}

export default function FeedbackPage({ params, searchParams }: FeedbackPageProps) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <FeedbackData params={params} searchParams={searchParams} />
    </Suspense>
  )
}
