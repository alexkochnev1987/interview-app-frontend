import { getTranslations } from 'next-intl/server'

import { PageShell } from '@/components/ui/layout/page-shell'
import { LoadingStateCard } from '@/components/ui/state-card'

export default async function CandidateFeedbackLoading() {
  const t = await getTranslations('common')

  return (
    <PageShell>
      <LoadingStateCard label={t('loading')} />
    </PageShell>
  )
}
