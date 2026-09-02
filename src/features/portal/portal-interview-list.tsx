import { Grid } from '@/components/ui/layout/grid'
import { EmptyStateCard } from '@/components/ui/state-card'
import { PortalInterviewCard } from '@/features/portal/portal-interview-card'
import { PRACTICE_INTERVIEW_ITEM_ID } from '@/features/portal/practice-interview-item'
import { routes } from '@/i18n/routes'
import type { CandidatePortalInterviewListItem } from '@/lib/api'
import {
  derivePortalInterviewStatus,
  type PortalInterviewStatus,
} from '@/lib/portal-interview-status'

interface PortalInterviewListProps {
  items: CandidatePortalInterviewListItem[]
  emptyTitle: string
  emptyDescription: string
  statusLabels: Record<PortalInterviewStatus, string>
  updatedLabel: string
  practiceTagLabel: string
}

export function PortalInterviewList({
  items,
  emptyTitle,
  emptyDescription,
  statusLabels,
  updatedLabel,
  practiceTagLabel,
}: PortalInterviewListProps) {
  if (items.length === 0) {
    return <EmptyStateCard title={emptyTitle} description={emptyDescription} />
  }

  return (
    <Grid columns="cards-2-3" gap={4}>
      {items.map((item) => {
        const isPractice = item.id === PRACTICE_INTERVIEW_ITEM_ID
        return (
          <PortalInterviewCard
            key={item.id}
            item={item}
            statusLabel={statusLabels[derivePortalInterviewStatus(item)]}
            updatedLabel={updatedLabel}
            href={isPractice ? routes.portal.practice : undefined}
            tagOverride={isPractice ? { label: practiceTagLabel, tone: 'completed' } : undefined}
          />
        )
      })}
    </Grid>
  )
}
