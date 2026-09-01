'use client'

import { useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { useInterviewsQuery } from '@/components/interviews/hooks/use-interviews-query'
import { interviewsRootQueryKey } from '@/components/interviews/library/query-keys'
import { InterviewPickerFeed } from '@/components/interviews/picker/interview-picker-feed'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTableSurface } from '@/components/ui/data-table-surface'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { ModalShell } from '@/components/ui/modal-shell'
import { Pagination } from '@/components/ui/pagination'
import { StatusPill } from '@/components/ui/status-pill'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableCellValue } from '@/components/ui/table-cell-value'
import { BodyText } from '@/components/ui/text'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { updateInterview, type InterviewListItem, type TeamMember } from '@/lib/api'
import { ASSIGNED_HR_FILTER_UNASSIGNED } from '@/lib/assigned-hr-filter'
import { useIsDemo } from '@/lib/auth-context'
import { INTERVIEW_PAGE_LIMIT_OPTIONS } from '@/lib/interviews-query-state'
import { runMutation } from '@/lib/run-mutation'
import { useToastMessages } from '@/lib/use-toast-messages'

import { canDemoAssignInterviewToHr } from './hr-assign-policy'

type HrAssignInterviewDialogProps = {
  hrUser: TeamMember
  onDismiss: () => void
  onAssigned: () => void
}

export function HrAssignInterviewDialog({
  hrUser,
  onDismiss,
  onAssigned,
}: HrAssignInterviewDialogProps) {
  const t = useTranslations('profile.assignedInterviews.assignDialog')
  const tTable = useTranslations('interviews.library.table')
  const sharedLabels = useSharedLabels()
  const toastMessages = useToastMessages()
  const queryClient = useQueryClient()
  const isDemo = useIsDemo()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const query = useInterviewsQuery({
    initial: {
      assignedHrId: ASSIGNED_HR_FILTER_UNASSIGNED,
      view: 'table',
    },
    syncUrl: false,
    allowAssignedHrFilter: true,
  })

  const demoAssignAllowed = canDemoAssignInterviewToHr(isDemo, hrUser.demo)
  const assignDisabled = !selectedId || submitting || !demoAssignAllowed

  async function handleAssign() {
    if (!selectedId || !demoAssignAllowed) return

    setSubmitting(true)
    try {
      await runMutation(() => updateInterview(selectedId, { assignedHrId: hrUser.id }), {
        successMessage: toastMessages.interview.updateSuccess,
        errorMessage: toastMessages.interview.updateError,
      })
      await queryClient.invalidateQueries({ queryKey: interviewsRootQueryKey() })
      onAssigned()
      onDismiss()
    } catch {
      /* toast handled by runMutation */
    } finally {
      setSubmitting(false)
    }
  }

  function handleRowSelect(interview: InterviewListItem) {
    setSelectedId(interview.id)
  }

  const assignConfirmButton = (
    <Button
      type="button"
      variant="gradient"
      disabled={assignDisabled}
      onClick={() => void handleAssign()}
    >
      {submitting ? t('assigning') : t('assign')}
    </Button>
  )

  return (
    <ModalShell
      dismissDisabled={submitting}
      onDismiss={onDismiss}
      size="xl"
      accessibilityTitle={t('title')}
      accessibilityDescription={t('description', { name: hrUser.name })}
    >
      <CardHeader spacing="sm">
        <Inline justify="between" align="start">
          <Stack gap={1}>
            <CardTitle size="lg">{t('title')}</CardTitle>
            <BodyText size="sm" tone="muted">
              {t('description', { name: hrUser.name })}
            </BodyText>
          </Stack>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={submitting}
            onClick={onDismiss}
            aria-label={t('cancel')}
          >
            <Icon size="md">
              <X />
            </Icon>
          </Button>
        </Inline>
      </CardHeader>

      <CardContent spacing="lg">
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
              <DataTableSurface loading={query.loading} hasItems={query.items.length > 0}>
                <TableHeader>
                  <TableRow interactive="none">
                    <TableHead>{tTable('candidate')}</TableHead>
                    <TableHead>{tTable('position')}</TableHead>
                    <TableHead>{tTable('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.items.map((interview) => (
                    <TableRow
                      key={interview.id}
                      interactive
                      state={selectedId === interview.id ? 'selected' : 'default'}
                      onClick={() => handleRowSelect(interview)}
                      aria-pressed={selectedId === interview.id}
                    >
                      <TableCell>
                        <TableCellValue value={interview.candidateName} />
                      </TableCell>
                      <TableCell>
                        <TableCellValue value={interview.position} />
                      </TableCell>
                      <TableCell>
                        <StatusPill tone={interview.status} size="compact">
                          {sharedLabels.interviewStatus(interview.status)}
                        </StatusPill>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </DataTableSurface>
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

          <Inline justify="end" gap={2} wrap="wrap">
            <Button
              type="button"
              variant="outline-pill"
              shape="pill"
              disabled={submitting}
              onClick={onDismiss}
            >
              {t('cancel')}
            </Button>
            {isDemo && hrUser.demo ? (
              assignConfirmButton
            ) : (
              <DemoWriteGuard disabled={assignDisabled}>{assignConfirmButton}</DemoWriteGuard>
            )}
          </Inline>
        </Stack>
      </CardContent>
    </ModalShell>
  )
}
