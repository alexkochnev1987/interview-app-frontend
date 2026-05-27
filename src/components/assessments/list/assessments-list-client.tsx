'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { AssessmentCard } from '@/components/assessments/list/assessment-card'
import {
  AssessmentsListToolbar,
  type StatusFilter,
} from '@/components/assessments/list/assessments-list-toolbar'
import { Icon } from '@/components/ui/icon'
import { CardGrid } from '@/components/ui/layout/card-grid'
import { Stack } from '@/components/ui/layout/stack'
import { EmptyStateCard } from '@/components/ui/state-card'
import { type Interview } from '@/lib/api'
import { deriveReviewStatus } from '@/lib/assessment-status'

interface AssessmentsListClientProps {
  interviews: Interview[]
}

function matchesQuery(interview: Interview, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true
  const haystack = `${interview.candidateName} ${interview.position}`.toLowerCase()
  return haystack.includes(normalizedQuery)
}

export function AssessmentsListClient({
  interviews,
}: AssessmentsListClientProps) {
  const t = useTranslations('assessments.list')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()
    return interviews.filter((interview) => {
      if (status !== 'all' && deriveReviewStatus(interview) !== status) {
        return false
      }
      return matchesQuery(interview, normalizedQuery)
    })
  }, [interviews, status, deferredQuery])

  return (
    <Stack gap={6}>
      <AssessmentsListToolbar
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
      />

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
  )
}
