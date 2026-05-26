import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { PageShell } from '@/components/ui/layout/page-shell'
import { EmptyStateCard } from '@/components/ui/state-card'
import { Link } from '@/i18n/navigation'

type FlashErrorPageFallbackProps = {
  title: string
  description: string
  backHref?: string
  backLabel?: string
}

export function FlashErrorPageFallback({
  title,
  description,
  backHref = '/',
  backLabel = 'Back to home',
}: FlashErrorPageFallbackProps) {
  return (
    <PageShell>
      <EmptyStateCard
        icon={
          <Icon size="lg">
            <AlertCircle />
          </Icon>
        }
        title={title}
        description={description}
        action={
          <Button variant="outline" shape="pill" asChild>
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        }
      />
    </PageShell>
  )
}
