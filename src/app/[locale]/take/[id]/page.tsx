import { AlertCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { PageContent, PageMainLayout } from '@/components/layout/page-shell'
import { Icon } from '@/components/ui/icon'
import { EmptyStateCard } from '@/components/ui/state-card'
import { resolveTakeInterviewLocale, type Locale } from '@/i18n/locales'
import { type TakeInterviewData } from '@/lib/api'
import { getServerRequestContext, requestServer } from '@/lib/server-fetch'
import { readSearchParamToken } from '@/lib/text'

import { TakeInterviewClient } from './take-interview-client'

interface TakeInterviewPageProps {
  params: Promise<{ id: string; locale: Locale }>
  searchParams: Promise<{ token?: string | string[]; from?: string | string[] }>
}

export default async function TakeInterviewPage({ params, searchParams }: TakeInterviewPageProps) {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.take' })
  const resolvedSearchParams = await searchParams
  const token = readSearchParamToken(resolvedSearchParams.token)
  const from = readSearchParamToken(resolvedSearchParams.from)

  if (token) {
    return (
      <TakeInterviewClient
        id={id}
        candidateToken={token}
        isPortalContinuation={from === 'portal'}
      />
    )
  }

  const ctx = await getServerRequestContext(locale)
  const encodedId = encodeURIComponent(id)

  let interview: TakeInterviewData | null = null
  let error: string | null = null

  try {
    interview =
      (await requestServer<TakeInterviewData>(`/take/${encodedId}`, ctx, {
        withLocaleHeader: false,
        // Omit contentLocale: API resolves questions via interviewLocale.
      })) ?? null
  } catch (err) {
    error = err instanceof Error ? err.message : t('loadFailedFallback')
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

  if (interview.interviewLocale) {
    const targetLocale = resolveTakeInterviewLocale(interview.interviewLocale)
    if (targetLocale !== locale) {
      redirect(`/${targetLocale}/take/${id}`)
    }
  }

  return <TakeInterviewClient id={id} initialInterview={interview} />
}
