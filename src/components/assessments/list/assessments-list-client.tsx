'use client'

import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { EvaluationActionsProvider } from '@/components/assessments/actions/evaluation-actions-context'
import { AssessmentCard } from '@/components/assessments/list/assessment-card'
import {
  AssessmentsListToolbar,
  type StatusFilter,
} from '@/components/assessments/list/assessments-list-toolbar'
import { LiveRefreshNotice } from '@/components/assessments/live-refresh-notice'
import { Icon } from '@/components/ui/icon'
import { CardGrid } from '@/components/ui/layout/card-grid'
import { Stack } from '@/components/ui/layout/stack'
import { EmptyStateCard } from '@/components/ui/state-card'
import { useOnboardingAssessmentsCardHighlight } from '@/features/onboarding/use-onboarding-tour-targets'
import { fetchInterviews, type InterviewListItem } from '@/lib/api'
import {
  deriveReviewStatusFromListItem,
  hasScoringInProgressListItems,
  selectHrVisibleListItems,
} from '@/lib/assessment-status'
import {
  ASSESSMENTS_INTERVIEW_PAGE_SIZE,
  fetchAllInterviewPages,
} from '@/lib/fetch-all-interviews'
import { isOnboardingStarterInterview } from '@/lib/onboarding-starter'
import { useLivePolling } from '@/lib/use-live-polling'

interface AssessmentsListClientProps {
  interviews: InterviewListItem[]
}

function matchesQuery(interview: InterviewListItem, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true
  const haystack = `${interview.candidateName} ${interview.position}`.toLowerCase()
  return haystack.includes(normalizedQuery)
}

function pickTourAssessment(
  interviews: InterviewListItem[],
): InterviewListItem | undefined {
  const real = interviews.filter(
    (interview) => !isOnboardingStarterInterview(interview),
  )

  return (
    real.find(
      (interview) => deriveReviewStatusFromListItem(interview) === 'ready_to_score',
    )
    ?? real.find((interview) => deriveReviewStatusFromListItem(interview) === 'ready')
    ?? real[0]
    ?? interviews.find((interview) => isOnboardingStarterInterview(interview))
    ?? interviews[0]
  )
}

export function AssessmentsListClient({
  interviews: initialInterviews,
}: AssessmentsListClientProps) {
  const t = useTranslations('assessments.list')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const deferredQuery = useDeferredValue(query)

  const fetcher = useCallback(async () => {
    const items = await fetchAllInterviewPages(fetchInterviews, {
      limit: ASSESSMENTS_INTERVIEW_PAGE_SIZE,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    })
    return selectHrVisibleListItems(items)
  }, [])
  const { data: interviews, refresh, kick, paused } = useLivePolling(
    initialInterviews,
    fetcher,
    hasScoringInProgressListItems,
  )

  const onEvaluationStarted = useCallback(() => {
    kick()
    void refresh()
  }, [kick, refresh])

  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()
    return interviews.filter((interview) => {
      if (status !== 'all' && deriveReviewStatusFromListItem(interview) !== status) {
        return false
      }
      return matchesQuery(interview, normalizedQuery)
    })
  }, [interviews, status, deferredQuery])

  const tourAssessment = useMemo(
    () => pickTourAssessment(filtered),
    [filtered],
  )
  const tourHighlightId = useOnboardingAssessmentsCardHighlight(tourAssessment?.id)

  return (
    <EvaluationActionsProvider onEvaluationStarted={onEvaluationStarted}>
      <Stack gap={6}>
        <AssessmentsListToolbar
          query={query}
          onQueryChange={setQuery}
          status={status}
          onStatusChange={setStatus}
        />

        {paused ? <LiveRefreshNotice onRefresh={refresh} /> : null}

        {filtered.length === 0 ? (
          <EmptyStateCard
            icon={<Icon size="lg"><Search /></Icon>}
            title={
              interviews.length === 0
                ? t('emptyTitle')
                : t('emptyFilteredTitle')
            }
            description={
              interviews.length === 0
                ? t('emptyDescription')
                : t('emptyFilteredDescription')
            }
          />
        ) : (
          <CardGrid>
            {filtered.map((interview) => (
              <AssessmentCard
                key={interview.id}
                interview={interview}
                tourTarget={
                  interview.id === tourHighlightId ? 'assessments-card' : undefined
                }
              />
            ))}
          </CardGrid>
        )}
      </Stack>
    </EvaluationActionsProvider>
  )
}
