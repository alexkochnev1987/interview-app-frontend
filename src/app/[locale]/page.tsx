import { getTranslations } from 'next-intl/server'

import { DashboardView } from '@/components/dashboard/dashboard-view'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { type Interview } from '@/lib/api'
import { canAccessDashboard } from '@/lib/auth-roles'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
  redirectIfUnauthorizedError,
} from '@/lib/auth-gate'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

const ERROR_SIGN_IN_HREF = '/login'
const ERROR_ESCAPE_HREF = routes.questions.list

interface DashboardPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.dashboard' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const auth = await loadAuthGate(canAccessDashboard, locale)
  redirectIfUnauthenticated(auth, '/', locale)
  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={t('forbiddenTitle')}
        description={t('forbiddenDescription')}
      />
    )
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={`${tCommon('sessionVerificationFailed')} ${auth.message}`}
        backHref={ERROR_SIGN_IN_HREF}
        backLabel={t('signInActionLabel')}
      />
    )
  }

  let interviews: Interview[] = []
  let error: string | null = null

  try {
    interviews =
      (await requestServer<Interview[]>('/interviews', auth.ctx)) ?? []
  } catch (err) {
    redirectIfUnauthorizedError(err, '/', locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={t('forbiddenTitle')}
          description={t('forbiddenDescription')}
        />
      )
    }
    error =
      err instanceof Error ? err.message : t('loadFailedFallback')
  }

  if (error) {
    return (
      <FlashErrorPageFallback
        title={t('loadFailedTitle')}
        description={error}
        backHref={ERROR_ESCAPE_HREF}
        backLabel={t('questionBankActionLabel')}
      />
    )
  }

  return <DashboardView interviews={interviews} isDemo={auth.me.demo} />
}
