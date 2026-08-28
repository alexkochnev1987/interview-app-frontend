'use client'

import { BriefcaseBusiness } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { useInterviewsQuery } from '@/components/interviews/hooks/use-interviews-query'
import { InterviewTable } from '@/components/interviews/library/interview-table'
import { InterviewPickerFeed } from '@/components/interviews/picker/interview-picker-feed'
import { InterviewPickerRefetchAlert } from '@/components/interviews/picker/interview-picker-refetch-alert'
import { Button } from '@/components/ui/button'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { DisabledHintTooltip } from '@/components/ui/disabled-hint-tooltip'
import { Icon } from '@/components/ui/icon'
import { Stack } from '@/components/ui/layout/stack'
import { Pagination } from '@/components/ui/pagination'
import { useRouter } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import type { TeamMember } from '@/lib/api'
import { useIsDemo } from '@/lib/auth-context'
import type { InterviewsLibraryPrefetch } from '@/lib/interviews-library-prefetch'
import { INTERVIEW_PAGE_LIMIT_OPTIONS } from '@/lib/interviews-query-state'

import { HrAssignInterviewDialog } from './hr-assign-interview-dialog'
import { canDemoAssignInterviewToHr } from './hr-assign-policy'

type HrAssignedInterviewsSectionProps = {
  hrUser: TeamMember
  initialPrefetch?: InterviewsLibraryPrefetch
}

export function HrAssignedInterviewsSection({
  hrUser,
  initialPrefetch,
}: HrAssignedInterviewsSectionProps) {
  const t = useTranslations('profile.assignedInterviews')
  const router = useRouter()
  const isDemo = useIsDemo()
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  const demoAssignBlocked = isDemo && !canDemoAssignInterviewToHr(isDemo, hrUser.demo)
  const assignDisabled = demoAssignBlocked

  const query = useInterviewsQuery({
    initial: {
      ...initialPrefetch?.queryState,
      assignedHrId: hrUser.id,
      view: 'table',
    },
    serverHydrated: Boolean(initialPrefetch),
    syncUrl: false,
    allowAssignedHrFilter: true,
  })

  const assignButton = (
    <Button
      type="button"
      variant="outline-pill"
      shape="pill"
      size="sm"
      disabled={assignDisabled}
      onClick={() => {
        if (!assignDisabled) setAssignDialogOpen(true)
      }}
    >
      {t('assignAnother')}
    </Button>
  )

  const assignAction =
    isDemo && hrUser.demo ? (
      assignButton
    ) : demoAssignBlocked ? (
      <DisabledHintTooltip active hint={t('demoAssignOnlyDemoHr')} width="auto">
        {assignButton}
      </DisabledHintTooltip>
    ) : (
      <DemoWriteGuard disabled={assignDisabled}>{assignButton}</DemoWriteGuard>
    )

  return (
    <>
      <CollapsibleSection
        title={t('title')}
        leadingIcon={
          <Icon size="md">
            <BriefcaseBusiness />
          </Icon>
        }
        actions={assignAction}
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
            onReset={query.reset}
            renderTable={() => (
              <InterviewTable
                items={query.items}
                sortBy={query.state.sortBy}
                sortOrder={query.state.sortOrder}
                onSortChange={query.setSort}
                onRowClick={(interview) => router.push(routes.interviews.detail(interview.id))}
                page={query.state.page}
                loading={query.loading}
                surfaceVariant="plain"
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

      {assignDialogOpen ? (
        <HrAssignInterviewDialog
          hrUser={hrUser}
          onDismiss={() => setAssignDialogOpen(false)}
          onAssigned={() => void query.refetch()}
        />
      ) : null}
    </>
  )
}
