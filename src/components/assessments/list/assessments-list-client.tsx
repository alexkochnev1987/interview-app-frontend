'use client'

import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'

import { EvaluationActionsProvider } from '@/components/assessments/actions/evaluation-actions-context'
import { AssessmentCard } from '@/components/assessments/list/assessment-card'
import {
  AssessmentsListToolbar,
  type StatusFilter,
} from '@/components/assessments/list/assessments-list-toolbar'
import { AssessmentLiveRefreshNotice } from '@/components/assessments/live-refresh-notice'
import { Icon } from '@/components/ui/icon'
import { CardGrid } from '@/components/ui/layout/card-grid'
import { Stack } from '@/components/ui/layout/stack'
import { EmptyStateCard } from '@/components/ui/state-card'
import { useOnboardingAssessmentsCardHighlight } from '@/features/onboarding/use-onboarding-tour-targets'
import { usePathname, useRouter } from '@/i18n/navigation'
import { fetchInterviews, type InterviewListItem } from '@/lib/api'
import {
  deriveReviewStatusFromListItem,
  hasScoringInProgressListItems,
  selectHrVisibleListItems,
} from '@/lib/assessment-status'
import {
  ASSESSMENTS_SEARCH_DEBOUNCE_MS,
  readAssessmentsFromSearchParams,
  writeAssessmentsToSearchParams,
} from '@/lib/assessments-query-state'
import { ASSESSMENTS_INTERVIEW_PAGE_SIZE, fetchAllInterviewPages } from '@/lib/fetch-all-interviews'
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

function pickTourAssessment(interviews: InterviewListItem[]): InterviewListItem | undefined {
  const real = interviews.filter((interview) => !isOnboardingStarterInterview(interview))

  return (
    real.find((interview) => deriveReviewStatusFromListItem(interview) === 'ready_to_score') ??
    real.find((interview) => deriveReviewStatusFromListItem(interview) === 'ready') ??
    real[0] ??
    interviews.find((interview) => isOnboardingStarterInterview(interview)) ??
    interviews[0]
  )
}

export function AssessmentsListClient({
  interviews: initialInterviews,
}: AssessmentsListClientProps) {
  const t = useTranslations('assessments.list')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastWrittenUrlRef = useRef<string | null>(searchParams?.toString() ?? null)

  const [query, setQuery] = useState(
    () => readAssessmentsFromSearchParams(searchParams ?? new URLSearchParams()).q,
  )
  const [status, setStatus] = useState<StatusFilter>(
    () => readAssessmentsFromSearchParams(searchParams ?? new URLSearchParams()).status,
  )
  const deferredQuery = useDeferredValue(query)
  const [debouncedQuery, setDebouncedQuery] = useState(() => query)

  useEffect(() => {
    if (query === debouncedQuery) return
    const handle = window.setTimeout(() => setDebouncedQuery(query), ASSESSMENTS_SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [query, debouncedQuery])

  const stateUrl = useMemo(
    () => writeAssessmentsToSearchParams({ q: debouncedQuery, status }).toString(),
    [debouncedQuery, status],
  )

  useEffect(() => {
    const currentUrl = searchParams?.toString() ?? ''
    if (stateUrl === currentUrl) {
      lastWrittenUrlRef.current = currentUrl
      return
    }
    if (currentUrl !== lastWrittenUrlRef.current) {
      const fromUrl = readAssessmentsFromSearchParams(searchParams ?? new URLSearchParams())
      lastWrittenUrlRef.current = currentUrl
      setQuery(fromUrl.q)
      setDebouncedQuery(fromUrl.q)
      setStatus(fromUrl.status)
      return
    }
    const url = stateUrl.length > 0 ? `${pathname}?${stateUrl}` : pathname
    lastWrittenUrlRef.current = stateUrl
    router.replace(url, { scroll: false })
  }, [stateUrl, pathname, router, searchParams])

  const fetcher = useCallback(async () => {
    const items = await fetchAllInterviewPages(fetchInterviews, {
      limit: ASSESSMENTS_INTERVIEW_PAGE_SIZE,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    })
    return selectHrVisibleListItems(items)
  }, [])
  const {
    data: interviews,
    refresh,
    kick,
    paused,
  } = useLivePolling(initialInterviews, fetcher, hasScoringInProgressListItems)

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

  const tourAssessment = useMemo(() => pickTourAssessment(filtered), [filtered])
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

        {paused ? <AssessmentLiveRefreshNotice onRefresh={refresh} /> : null}

        {filtered.length === 0 ? (
          <EmptyStateCard
            icon={
              <Icon size="lg">
                <Search />
              </Icon>
            }
            title={interviews.length === 0 ? t('emptyTitle') : t('emptyFilteredTitle')}
            description={
              interviews.length === 0 ? t('emptyDescription') : t('emptyFilteredDescription')
            }
          />
        ) : (
          <CardGrid>
            {filtered.map((interview) => (
              <AssessmentCard
                key={interview.id}
                interview={interview}
                tourTarget={interview.id === tourHighlightId ? 'assessments-card' : undefined}
              />
            ))}
          </CardGrid>
        )}
      </Stack>
    </EvaluationActionsProvider>
  )
}
