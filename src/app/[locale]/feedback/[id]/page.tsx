import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { FeedbackView } from '@/components/feedback/feedback-view'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { loadLocaleMessages } from '@/i18n/load-messages'
import type { Locale } from '@/i18n/locales'
import { type FeedbackResponse } from '@/lib/api'
import { getServerRequestContext, requestServer } from '@/lib/server-fetch'
import { readSearchParamToken } from '@/lib/text'

interface FeedbackPageProps {
  params: Promise<{ id: string; locale: Locale }>
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function FeedbackPage({
  params,
  searchParams,
}: FeedbackPageProps) {
  const { id } = await params
  const t = await getTranslations({ locale: 'en', namespace: 'toast.pageGate.feedback' })
  const englishMessages = await loadLocaleMessages('en')
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
        : t('loadFailedFallback')
  }

  if (error || !feedback) {
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={error ?? t('loadFailedFallback')}
      />
    )
  }

  return (
    <NextIntlClientProvider locale="en" messages={englishMessages}>
      <FeedbackView feedback={feedback} />
    </NextIntlClientProvider>
  )
}
