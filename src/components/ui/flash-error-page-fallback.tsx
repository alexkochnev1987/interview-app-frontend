import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FlashErrorToast } from '@/components/ui/flash-error-toast'
import { Icon } from '@/components/ui/icon'
import { PageShell } from '@/components/ui/layout/page-shell'
import { EmptyStateCard } from '@/components/ui/state-card'

type FlashErrorPageFallbackProps = {
  toastId: string
  toastMessage: string
  toastDescription?: string
  title: string
  description: string
  backHref?: string
  backLabel?: string
}

export function FlashErrorPageFallback({
  toastId,
  toastMessage,
  toastDescription,
  title,
  description,
  backHref = '/',
  backLabel = 'Back to home',
}: FlashErrorPageFallbackProps) {
  return (
    <PageShell>
      <FlashErrorToast
        toastId={toastId}
        message={toastMessage}
        description={toastDescription}
      />
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
