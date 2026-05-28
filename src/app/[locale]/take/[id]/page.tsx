import { AlertCircle } from 'lucide-react'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { PageContent, PageMainLayout } from '@/components/layout/page-shell'
import { Icon } from '@/components/ui/icon'
import { EmptyStateCard } from '@/components/ui/state-card'
import { loadLocaleMessages } from '@/i18n/load-messages'
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
  const { id } = await params
  const t = await getTranslations({ locale: 'en', namespace: 'toast.pageGate.take' })
  const englishMessages = await loadLocaleMessages('en')
  const token = readSearchParamToken((await searchParams).token)

  if (token) {
    return (
      <NextIntlClientProvider locale="en" messages={englishMessages}>
        <TakeInterviewClient id={id} candidateToken={token} />
      </NextIntlClientProvider>
    )
  }

  const ctx = await getServerRequestContext()
  const encodedId = encodeURIComponent(id)

  let interview: TakeInterviewData | null = null
  let error: string | null = null

  try {
    interview =
      (await requestServer<TakeInterviewData>(`/take/${encodedId}`, ctx)) ?? null
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

  return (
    <NextIntlClientProvider locale="en" messages={englishMessages}>
      <TakeInterviewClient id={id} initialInterview={interview} />
    </NextIntlClientProvider>
  )
}
