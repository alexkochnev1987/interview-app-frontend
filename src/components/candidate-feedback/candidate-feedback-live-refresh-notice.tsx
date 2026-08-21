'use client'

import { useTranslations } from 'next-intl'

import { LiveRefreshNotice as UiLiveRefreshNotice } from '@/components/ui/live-refresh-notice'

interface CandidateFeedbackLiveRefreshNoticeProps {
  onRefresh: () => void
}

export function CandidateFeedbackLiveRefreshNotice({
  onRefresh,
}: CandidateFeedbackLiveRefreshNoticeProps) {
  const t = useTranslations('interviews.candidateFeedback.liveRefresh')

  return (
    <UiLiveRefreshNotice
      title={t('title')}
      description={t('description')}
      refreshLabel={t('refresh')}
      onRefresh={onRefresh}
    />
  )
}
