import { Clock, PlayCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { CandidateFeedbackContent } from '@/components/feedback/candidate-feedback-content'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { CandidateDetailHeader } from '@/features/portal/candidate-detail-header'
import { CandidatePrepTipsCard } from '@/features/portal/candidate-prep-tips-card'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import type { CandidatePortalInterviewListItem, CandidatePortalInterviewResults } from '@/lib/api'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
  redirectIfUnauthorizedError,
} from '@/lib/auth-gate'
import { canAccessCandidatePortal } from '@/lib/auth-roles'
import { derivePortalInterviewStatus, shouldShowPrepTips } from '@/lib/portal-interview-status'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

interface PortalInterviewDetailPageProps {
  params: Promise<{ id: string; locale: Locale }>
}

export default async function PortalInterviewDetailPage({
  params,
}: PortalInterviewDetailPageProps) {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'portal' })
  const returnPath = routes.portal.interviewDetail(id)

  const auth = await loadAuthGate(canAccessCandidatePortal, locale)
  redirectIfUnauthenticated(auth, returnPath, locale)
  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={t('myInterviews.forbiddenTitle')}
        description={t('myInterviews.forbiddenDescription')}
      />
    )
  }
  if (auth.kind === 'error') {
    return <FlashErrorPageFallback title={t('detail.loadFailedTitle')} description={auth.message} />
  }

  const encodedId = encodeURIComponent(id)
  let item: CandidatePortalInterviewListItem | null = null
  let results: CandidatePortalInterviewResults | null = null
  let error: string | null = null

  try {
    item =
      (await requestServer<CandidatePortalInterviewListItem>(
        `/portal/interviews/${encodedId}`,
        auth.ctx,
      )) ?? null

    if (item?.resultsReady) {
      results =
        (await requestServer<CandidatePortalInterviewResults>(
          `/portal/interviews/${encodedId}/results`,
          auth.ctx,
        )) ?? null
    }
  } catch (err) {
    redirectIfUnauthorizedError(err, returnPath, locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={t('myInterviews.forbiddenTitle')}
          description={t('myInterviews.forbiddenDescription')}
        />
      )
    }
    error = err instanceof Error ? err.message : t('detail.loadFailedFallback')
  }

  if (error || !item) {
    return (
      <FlashErrorPageFallback
        title={t('detail.loadFailedTitle')}
        description={error ?? t('detail.loadFailedFallback')}
      />
    )
  }

  const status = derivePortalInterviewStatus(item)
  const statusLabel = t(`status.${status}`)

  // Preset outcome copy is candidate-facing content and must match
  // interviewLocale, matching the public share page's same convention.
  let outcomeMessage = ''
  if (results?.outcome) {
    if (results.outcome === 'custom') {
      outcomeMessage = results.outcomeMessage?.trim() ?? ''
    } else {
      const tShareOutcome = await getTranslations({
        locale: results.interviewLocale,
        namespace: 'feedback.share',
      })
      outcomeMessage = tShareOutcome(`outcome.${results.outcome}`)
    }
  }

  return (
    <PageShell>
      <Section width="reading" gap={6}>
        <CandidateDetailHeader
          position={item.position}
          status={status}
          statusLabel={statusLabel}
          updatedAt={item.updatedAt}
          backLabel={t('detail.backToList')}
        />

        {shouldShowPrepTips(status) ? (
          <CandidatePrepTipsCard
            title={t('detail.tips.title')}
            questionCountLabel={t('detail.tips.questionCount', { count: item.questionCount })}
            retryLabel={t('detail.tips.retry', { count: item.maxAnswerAttempts })}
            cameraTip={t('detail.tips.camera')}
            connectionTip={t('detail.tips.connection')}
          />
        ) : null}

        {item.continueUrl ? (
          <Card variant="tinted">
            <CardHeader spacing="xs">
              <CardTitle size="md">{t('detail.continueTitle')}</CardTitle>
            </CardHeader>
            <CardContent spacing="md">
              <Stack gap={4}>
                <BodyText size="base" tone="foreground">
                  {t('detail.continueDescription')}
                </BodyText>
                <Button asChild variant="gradient" size="lg">
                  <UnstyledLink href={item.continueUrl}>
                    <Inline gap={2} align="center">
                      <Icon size="sm">
                        <PlayCircle />
                      </Icon>
                      {t('detail.continueCta')}
                    </Inline>
                  </UnstyledLink>
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {!item.continueUrl && !results ? (
          <Card variant="tinted">
            <CardContent spacing="md">
              <Inline gap={3} align="center">
                <Icon size="sm" tone="inherit">
                  <Clock />
                </Icon>
                <Stack gap={1}>
                  <BodyText size="base" tone="foreground" weight="semibold">
                    {status === 'failed' ? t('detail.failedTitle') : t('detail.notReadyTitle')}
                  </BodyText>
                  <BodyText size="sm" tone="muted">
                    {status === 'failed'
                      ? t('detail.failedDescription')
                      : t('detail.notReadyDescription')}
                  </BodyText>
                </Stack>
              </Inline>
            </CardContent>
          </Card>
        ) : null}

        {results ? (
          <Stack gap={4}>
            <Stack gap={2}>
              <EyebrowLabel size="lg">{t('detail.resultsEyebrow')}</EyebrowLabel>
              <SectionHeading>{t('detail.resultsTitle')}</SectionHeading>
            </Stack>
            <CandidateFeedbackContent feedback={results} outcomeMessage={outcomeMessage} />
          </Stack>
        ) : null}
      </Section>
    </PageShell>
  )
}
