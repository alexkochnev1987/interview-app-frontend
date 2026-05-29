import { getTranslations } from 'next-intl/server'

import { AssessmentsListClient } from '@/components/assessments/list/assessments-list-client'
import { AssessmentsListHeader } from '@/components/assessments/list/assessments-list-header'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { type Interview } from '@/lib/api'
import { getCompletionDate } from '@/lib/assessment-status'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
  redirectIfUnauthorizedError,
} from '@/lib/auth-gate'
import { canReviewAssessments } from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

const HR_VISIBLE_STATUSES: ReadonlySet<Interview['status']> = new Set<
  Interview['status']
>(['processing', 'completed', 'failed'])

const ERROR_BACK_HREF = '/'

function sortByCompletion(a: Interview, b: Interview): number {
  const ca = getCompletionDate(a)
  const cb = getCompletionDate(b)

  if (ca && !cb) return -1
  if (!ca && cb) return 1

  const da = ca ?? a.updatedAt
  const db = cb ?? b.updatedAt
  return new Date(db).getTime() - new Date(da).getTime()
}

interface AssessmentsPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function AssessmentsPage({
  params,
}: AssessmentsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.assessments' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const auth = await loadAuthGate(canReviewAssessments, locale)
  redirectIfUnauthenticated(auth, '/assessments', locale)
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
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  let interviews: Interview[] = []
  let error: string | null = null

  try {
    interviews =
      (await requestServer<Interview[]>('/interviews', auth.ctx)) ?? []
  } catch (err) {
    redirectIfUnauthorizedError(err, '/assessments', locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={t('forbiddenTitle')}
          description={t('forbiddenDescription')}
        />
      )
    }
    error =
      err instanceof Error
        ? err.message
        : t('loadFailedFallback')
  }

  if (error) {
    return (
      <FlashErrorPageFallback
        title={t('loadFailedTitle')}
        description={error}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  const sorted = interviews
    .filter((i) => HR_VISIBLE_STATUSES.has(i.status))
    .sort(sortByCompletion)

  return (
    <PageShell>
      <AssessmentsListHeader />
      <AssessmentsListClient interviews={sorted} />
    </PageShell>
  )
}
