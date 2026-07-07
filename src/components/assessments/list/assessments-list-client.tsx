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
import { useLivePolling } from '@/lib/use-live-polling'

interface AssessmentsListClientProps {
  interviews: InterviewListItem[]
}

function matchesQuery(interview: InterviewListItem, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true
  const haystack = `${interview.candidateName} ${interview.position}`.toLowerCase()
  return haystack.includes(normalizedQuery)
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
              <AssessmentCard key={interview.id} interview={interview} />
            ))}
          </CardGrid>
        )}
      </Stack>
    </EvaluationActionsProvider>
  )
}
