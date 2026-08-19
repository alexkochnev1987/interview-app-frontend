'use client'

import { useTranslations } from 'next-intl'

import { LiveRefreshNotice as UiLiveRefreshNotice } from '@/components/ui/live-refresh-notice'

interface LiveRefreshNoticeProps {
  onRefresh: () => void
}

export function LiveRefreshNotice({ onRefresh }: LiveRefreshNoticeProps) {
  const t = useTranslations('assessments.liveRefresh')

  return (
    <UiLiveRefreshNotice
      title={t('title')}
      description={t('description')}
      refreshLabel={t('refresh')}
      onRefresh={onRefresh}
    />
  )
}
