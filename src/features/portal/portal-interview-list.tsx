import { Grid } from '@/components/ui/layout/grid'
import { EmptyStateCard } from '@/components/ui/state-card'
import { PortalInterviewCard } from '@/features/portal/portal-interview-card'
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
}

export function PortalInterviewList({
  items,
  emptyTitle,
  emptyDescription,
  statusLabels,
  updatedLabel,
}: PortalInterviewListProps) {
  if (items.length === 0) {
    return <EmptyStateCard title={emptyTitle} description={emptyDescription} />
  }

  return (
    <Grid columns="cards-2-3" gap={4}>
      {items.map((item) => (
        <PortalInterviewCard
          key={item.id}
          item={item}
          statusLabel={statusLabels[derivePortalInterviewStatus(item)]}
          updatedLabel={updatedLabel}
        />
      ))}
    </Grid>
  )
}
