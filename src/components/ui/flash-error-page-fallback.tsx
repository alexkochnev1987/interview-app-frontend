import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  showAction?: boolean
}

export function FlashErrorPageFallback({
  title,
  description,
  backHref = '/',
  backLabel,
  showAction = true,
}: FlashErrorPageFallbackProps) {
  const t = useTranslations('common')

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
        action={showAction ? (
          <Button variant="outline" shape="pill" asChild>
            <Link href={backHref}>{backLabel ?? t('backToHome')}</Link>
          </Button>
        ) : undefined}
      />
    </PageShell>
  )
}
