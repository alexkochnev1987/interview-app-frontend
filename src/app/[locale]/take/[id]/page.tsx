import { AlertCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { PageContent, PageMainLayout } from '@/components/layout/page-shell'
import { Icon } from '@/components/ui/icon'
import { EmptyStateCard } from '@/components/ui/state-card'
import type { Locale } from '@/i18n/locales'
import { type TakeInterviewData } from '@/lib/api'
import { getServerRequestContext, requestServer } from '@/lib/server-fetch'
import { readSearchParamToken } from '@/lib/text'
import { TakeInterviewClient } from './take-interview-client'

interface TakeInterviewPageProps {
  params: Promise<{ id: string; locale: Locale }>
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function TakeInterviewPage({
  params,
  searchParams,
}: TakeInterviewPageProps) {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.take' })
  const token = readSearchParamToken((await searchParams).token)

  if (token) {
    return <TakeInterviewClient id={id} candidateToken={token} />
  }

  const ctx = await getServerRequestContext(locale)
  const encodedId = encodeURIComponent(id)

  let interview: TakeInterviewData | null = null
  let error: string | null = null

  try {
    interview =
      (await requestServer<TakeInterviewData>(`/take/${encodedId}`, ctx, {
        withLocaleHeader: false,
        query: { contentLocale: locale },
      })) ?? null
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : t('loadFailedFallback')
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
            title={t('unavailableTitle')}
            description={error ?? t('loadFailedFallback')}
          />
        </PageContent>
      </PageMainLayout>
    )
  }

  return <TakeInterviewClient id={id} initialInterview={interview} />
}
