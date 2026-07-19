import { getTranslations } from 'next-intl/server'

import { RecruiterAssistantChat } from '@/components/assistant/recruiter-assistant-chat'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { loadAuthGate, redirectIfUnauthenticated } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'

interface AssistantPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function AssistantPage({ params }: AssistantPageProps) {
  const { locale } = await params
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const auth = await loadAuthGate(canConfigureInterview, locale)
  redirectIfUnauthenticated(auth, routes.assistant, locale)

  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title="Assistant unavailable"
        description="Your account cannot configure interviews."
      />
    )
  }

  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title="Assistant unavailable"
        description={`${tCommon('sessionVerificationFailed')} ${auth.message}`}
        backHref="/"
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  return (
    <PageShell>
      <RecruiterAssistantChat />
    </PageShell>
  )
}
