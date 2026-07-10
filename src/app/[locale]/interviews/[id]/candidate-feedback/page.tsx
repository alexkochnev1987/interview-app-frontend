import { getTranslations } from 'next-intl/server'

import { CandidateFeedbackEditor } from '@/components/candidate-feedback/candidate-feedback-editor'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { routes } from '@/i18n/routes'
import type { Locale } from '@/i18n/locales'
import { type Interview } from '@/lib/api'
import { isApiError } from '@/lib/api-error'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
  redirectIfUnauthorizedError,
} from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import {
  candidateFeedbackPath,
  createEmptyCandidateFeedback,
  type CandidateFeedbackResponse,
} from '@/lib/candidate-feedback'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

interface CandidateFeedbackPageProps {
  params: Promise<{ id: string; locale: Locale }>
}

export default async function CandidateFeedbackPage({
  params,
}: CandidateFeedbackPageProps) {
  const { id, locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'toast.pageGate.candidateFeedback',
  })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })

  const returnPath = candidateFeedbackPath(id)
  const backHref = routes.interviews.detail(id)
  const auth = await loadAuthGate(canConfigureInterview, locale)
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
        backHref={backHref}
        backLabel={tFallback('backToInterview')}
      />
    )
  }

  const encodedId = encodeURIComponent(id)
  let interview: Interview | null = null
  let feedback: CandidateFeedbackResponse | null = null
  let error: string | null = null
  let notFound = false

  const [interviewResult, feedbackResult] = await Promise.allSettled([
    requestServer<Interview>(`/interviews/${encodedId}`, auth.ctx, {
      withLocaleHeader: false,
    }),
    requestServer<CandidateFeedbackResponse>(
      `/interviews/${encodedId}/candidate-feedback`,
      auth.ctx,
      { withLocaleHeader: false },
    ),
  ])

  if (interviewResult.status === 'rejected') {
    const err = interviewResult.reason
    redirectIfUnauthorizedError(err, returnPath, locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={t('forbiddenTitle')}
          description={t('forbiddenDescription')}
        />
      )
    }
    if (isApiError(err) && err.status === 404) {
      notFound = true
    } else {
      error =
        err instanceof Error
          ? err.message
          : t('loadFailedFallback')
    }
  } else {
    interview = interviewResult.value ?? null
  }

  if (!notFound && !error && interview) {
    if (feedbackResult.status === 'rejected') {
      const err = feedbackResult.reason
      redirectIfUnauthorizedError(err, returnPath, locale)
      if (isForbiddenError(err)) {
        return (
          <ForbiddenAccessPage
            title={t('forbiddenTitle')}
            description={t('forbiddenDescription')}
          />
        )
      }
      if (isApiError(err) && err.status === 404) {
        feedback = createEmptyCandidateFeedback(
          interview.id,
          interview.interviewLocale ?? locale,
        )
      } else {
        error =
          err instanceof Error
            ? err.message
            : t('loadFailedFallback')
      }
    } else {
      feedback =
        feedbackResult.value ??
        createEmptyCandidateFeedback(
          interview.id,
          interview.interviewLocale ?? locale,
        )
    }
  }

  if (notFound || (!error && !interview)) {
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={t('notFoundFallback')}
        backHref={backHref}
        backLabel={tFallback('backToInterview')}
      />
    )
  }

  if (error || !interview || !feedback) {
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={error ?? t('loadFailedFallback')}
        backHref={backHref}
        backLabel={tFallback('backToInterview')}
      />
    )
  }

  return <CandidateFeedbackEditor interview={interview} initialFeedback={feedback} />
}
