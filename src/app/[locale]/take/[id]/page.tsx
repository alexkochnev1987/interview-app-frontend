import { Suspense } from 'react'

import { PageContent, PageMainLayout } from '@/components/layout/page-shell'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { type TakeInterviewData } from '@/lib/api'
import { getServerRequestContext, requestServer } from '@/lib/server-fetch'
import { readSearchParamToken } from '@/lib/text'

import { TakeInterviewClient } from './take-interview-client'

interface TakeInterviewPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string | string[] }>
}

async function TakeInterviewDataComponent({ params, searchParams }: TakeInterviewPageProps) {
  const { id } = await params
  const token = readSearchParamToken((await searchParams).token)

  if (token) {
    return <TakeInterviewClient id={id} candidateToken={token} />
  }

  const ctx = await getServerRequestContext()
  const encodedId = encodeURIComponent(id)
  const interview = await requestServer<TakeInterviewData>(`/take/${encodedId}`, ctx, {
    withLocaleHeader: false,
  })

  if (!interview) {
    throw new Error('Interview not found')
  }

  return <TakeInterviewClient id={id} initialInterview={interview} />
}

export default function TakeInterviewPage({ params, searchParams }: TakeInterviewPageProps) {
  return (
    <PageMainLayout>
      <PageContent>
        <Suspense fallback={<DetailPageSkeleton />}>
          <TakeInterviewDataComponent params={params} searchParams={searchParams} />
        </Suspense>
      </PageContent>
    </PageMainLayout>
  )
}
