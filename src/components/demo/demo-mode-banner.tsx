'use client'

import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageShell } from '@/components/ui/layout/page-shell'
import { useIsDemo } from '@/lib/auth-context'

export function DemoModeBanner() {
  const isDemo = useIsDemo()
  const t = useTranslations('common')

  if (!isDemo) {
    return null
  }

  return (
    <PageShell as="div" spacing="compact" padding="compact" data-testid="demo-mode-banner">
      <Alert variant="warning">
        <AlertTitle>{t('demoMode.bannerTitle')}</AlertTitle>
        <AlertDescription>{t('demoMode.bannerDescription')}</AlertDescription>
      </Alert>
    </PageShell>
  )
}
