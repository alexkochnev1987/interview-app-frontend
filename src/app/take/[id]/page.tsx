import { unstable_noStore as noStore } from 'next/cache'
import { AlertCircle } from 'lucide-react'

import { PageContent, PageMainLayout } from '@/components/layout/page-shell'
import { TakeInterviewClient } from '@/app/take/[id]/take-interview-client'
import { Icon } from '@/components/ui/icon'
import { EmptyStateCard } from '@/components/ui/state-card'
import { type TakeInterviewData } from '@/lib/api'
import { getServerRequestContext, requestServer } from '@/lib/server-fetch'
import { readSearchParamToken } from '@/lib/text'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

interface TakeInterviewPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function TakeInterviewPage({
  params,
  searchParams,
}: TakeInterviewPageProps) {
  noStore()

  const { id } = await params
  const token = readSearchParamToken((await searchParams).token)
  const ctx = await getServerRequestContext()
  const encodedId = encodeURIComponent(id)

  let interview: TakeInterviewData | null = null
  let error: string | null = null

  try {
    interview =
      (await requestServer<TakeInterviewData>(`/take/${encodedId}`, ctx, {
        query: token ? { token } : undefined,
      })) ?? null
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : 'Failed to load interview.'
  }

  if (error || !interview) {
    return (
      <PageMainLayout>
        <PageContent>
          <EmptyStateCard
            icon={
              <Icon size="lg">
                <AlertCircle />
              </Icon>
            }
            title={TOAST_MESSAGES.pageGate.interview.unavailableTitle}
            description={error ?? 'Failed to load interview.'}
          />
        </PageContent>
      </PageMainLayout>
    )
  }

  return (
    <TakeInterviewClient
      id={id}
      candidateToken={token}
      initialInterview={interview}
    />
  )
}
