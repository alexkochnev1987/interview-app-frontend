import { getTranslations } from 'next-intl/server'

import { AssessmentDetailContent } from '@/components/assessments/detail/assessment-detail-content'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { type Interview } from '@/lib/api'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
  redirectIfUnauthorizedError,
} from '@/lib/auth-gate'
import { canReviewAssessments } from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

interface AssessmentDetailPageProps {
  params: Promise<{ id: string; locale: Locale }>
}

export default async function AssessmentDetailPage({
  params,
}: AssessmentDetailPageProps) {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.assessments' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })

  const returnPath = `/assessments/${encodeURIComponent(id)}`
  const auth = await loadAuthGate(canReviewAssessments, locale)
  redirectIfUnauthenticated(auth, returnPath, locale)
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
        backHref="/assessments"
        backLabel={tFallback('backToAssessments')}
      />
    )
  }

  const encodedId = encodeURIComponent(id)
  let interview: Interview | null = null
  let error: string | null = null

  try {
    interview =
      (await requestServer<Interview>(`/interviews/${encodedId}`, auth.ctx, {
        withLocaleHeader: false,
      })) ??
      null
  } catch (err) {
    redirectIfUnauthorizedError(err, returnPath, locale)
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
        : t('loadDetailFallback')
  }

  if (error || !interview) {
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={error ?? t('notFoundFallback')}
        backHref="/assessments"
        backLabel={tFallback('backToAssessments')}
      />
    )
  }

  return (
    <PageShell>
      <AssessmentDetailContent initialInterview={interview} />
    </PageShell>
  )
}
