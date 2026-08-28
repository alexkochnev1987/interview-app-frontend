'use client'

import { BriefcaseBusiness } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { useInterviewsQuery } from '@/components/interviews/hooks/use-interviews-query'
import { InterviewTable } from '@/components/interviews/library/interview-table'
import { InterviewPickerFeed } from '@/components/interviews/picker/interview-picker-feed'
import { InterviewPickerRefetchAlert } from '@/components/interviews/picker/interview-picker-refetch-alert'
import { Button } from '@/components/ui/button'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Icon } from '@/components/ui/icon'
import { Stack } from '@/components/ui/layout/stack'
import { Pagination } from '@/components/ui/pagination'
import { Link, useRouter } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import type { TeamMember } from '@/lib/api'
import { normalizeEmail } from '@/lib/email-validation'
import type { InterviewsLibraryPrefetch } from '@/lib/interviews-library-prefetch'
import { INTERVIEW_PAGE_LIMIT_OPTIONS } from '@/lib/interviews-query-state'

type CandidateInterviewsSectionProps = {
  candidateUser: TeamMember
  initialPrefetch?: InterviewsLibraryPrefetch
}

function buildCreateInterviewHref(candidateUser: TeamMember): string {
  const params = new URLSearchParams()
  params.set('candidateName', candidateUser.name)
  params.set('candidateEmail', candidateUser.email)
  return `${routes.interviews.new}?${params.toString()}`
}

export function CandidateInterviewsSection({
  candidateUser,
  initialPrefetch,
}: CandidateInterviewsSectionProps) {
  const t = useTranslations('profile.candidateInterviews')
  const router = useRouter()
  const candidateEmail = normalizeEmail(candidateUser.email)

  const query = useInterviewsQuery({
    initial: {
      ...initialPrefetch?.queryState,
      candidateEmail,
      view: 'table',
    },
    serverHydrated: Boolean(initialPrefetch),
    syncUrl: false,
  })

  const createAction = (
    <DemoWriteGuard>
      <Button asChild variant="outline-pill" shape="pill" size="sm">
        <Link href={buildCreateInterviewHref(candidateUser)}>{t('createAnother')}</Link>
      </Button>
    </DemoWriteGuard>
  )

  return (
    <CollapsibleSection
      title={t('title')}
      leadingIcon={
        <Icon size="md">
          <BriefcaseBusiness />
        </Icon>
      }
      actions={createAction}
      expandLabel={t('expand')}
      collapseLabel={t('collapse')}
      tone="primary"
    >
      <Stack gap={4}>
        <InterviewPickerFeed
          items={query.items}
          total={query.total}
          loading={query.loading}
          error={query.blockingError}
          onRetry={query.refetch}
          view="table"
          debouncedQ={query.debouncedQ}
          hasActiveFilters
          renderTable={() => (
            <InterviewTable
              items={query.items}
              sortBy={query.state.sortBy}
              sortOrder={query.state.sortOrder}
              onSortChange={query.setSort}
              onRowClick={(interview) => router.push(routes.interviews.detail(interview.id))}
              page={query.state.page}
              loading={query.loading}
            />
          )}
          renderCards={() => null}
        />

        {!query.blockingError ? (
          <Pagination
            page={query.state.page}
            totalPages={query.totalPages}
            total={query.total}
            limit={query.state.limit}
            onPageChange={query.setPage}
            limitOptions={INTERVIEW_PAGE_LIMIT_OPTIONS}
            onLimitChange={query.setLimit}
          />
        ) : null}

        <InterviewPickerRefetchAlert error={query.paginationError} onRetry={query.refetch} />
      </Stack>
    </CollapsibleSection>
  )
}
