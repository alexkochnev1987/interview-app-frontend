'use client'

import { RefreshCw, ShieldAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'

interface LiveRefreshNoticeProps {
  onRefresh: () => void
}

export function LiveRefreshNotice({ onRefresh }: LiveRefreshNoticeProps) {
  const t = useTranslations('assessments.banner')

  return (
    <Alert variant="warning">
      <Icon size="md">
        <ShieldAlert />
      </Icon>
      <AlertTitle>{t('slowTitle')}</AlertTitle>
      <AlertDescription>
        <Inline gap={3} align="center" wrap="wrap">
          <span>{t('slowDescription')}</span>
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="sm"
            onClick={onRefresh}
          >
            <Icon size="md">
              <RefreshCw />
            </Icon>
            {t('refreshNow')}
          </Button>
        </Inline>
      </AlertDescription>
    </Alert>
  )
}
