'use client'

import { useTranslations } from 'next-intl'

import { LiveRefreshNotice as UiLiveRefreshNotice } from '@/components/ui/live-refresh-notice'

export interface AssessmentLiveRefreshNoticeProps {
  onRefresh: () => void
}

export function AssessmentLiveRefreshNotice({ onRefresh }: AssessmentLiveRefreshNoticeProps) {
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
