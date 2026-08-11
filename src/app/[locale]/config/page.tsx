import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { ConfigDashboard } from '@/components/config/config-dashboard'
import { PageShell } from '@/components/ui/layout/page-shell'
import { TableSkeleton } from '@/components/ui/skeleton'
import type { Locale } from '@/i18n/locales'
import type { SystemConfigEntry } from '@/lib/api'
import { requireAuthGate } from '@/lib/auth-gate'
import { isSuperAdmin } from '@/lib/auth-roles'
import { requestServer } from '@/lib/server-fetch'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'config' })

  return {
    title: t('title'),
    description: t('lead'),
  }
}

async function ConfigData({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { ctx } = await requireAuthGate(isSuperAdmin, '/config', locale as Locale)

  let initialConfigs: SystemConfigEntry[] = []
  try {
    const fetched = await requestServer<SystemConfigEntry[]>('/config', ctx)
    if (fetched) {
      initialConfigs = fetched
    }
  } catch {
    // If backend is unavailable or endpoint is not ready, start with empty list
    initialConfigs = []
  }

  return <ConfigDashboard initialConfigs={initialConfigs} />
}

export default function ConfigPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <PageShell>
      <Suspense fallback={<TableSkeleton />}>
        <ConfigData params={params} />
      </Suspense>
    </PageShell>
  )
}
