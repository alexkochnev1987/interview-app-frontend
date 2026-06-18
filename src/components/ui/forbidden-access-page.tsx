import { Lock } from 'lucide-react'

import { Icon } from '@/components/ui/icon'
import { PageShell } from '@/components/ui/layout/page-shell'
import { EmptyStateCard } from '@/components/ui/state-card'

interface ForbiddenAccessPageProps {
  title: string
  description: string
}

export function ForbiddenAccessPage({
  title,
  description,
}: ForbiddenAccessPageProps) {
  return (
    <PageShell>
      <EmptyStateCard
        icon={
          <Icon size="lg">
            <Lock />
          </Icon>
        }
        title={title}
        description={description}
      />
    </PageShell>
  )
}
