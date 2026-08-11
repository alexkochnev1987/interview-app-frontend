import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { ConfigDashboard } from '@/components/config/config-dashboard'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import type { SystemConfigEntry } from '@/lib/api'
import { isSuperAdmin } from '@/lib/auth-roles'
import { getServerSessionSnapshot } from '@/lib/auth-server'
import { getServerRequestContext, requestServer } from '@/lib/server-fetch'

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

export default async function ConfigPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [session, ctx, tConfig] = await Promise.all([
    getServerSessionSnapshot(),
    getServerRequestContext(locale),
    getTranslations({ locale, namespace: 'config' }),
  ])

  if (!isSuperAdmin(session.user?.role)) {
    return (
      <ForbiddenAccessPage
        title={tConfig('forbiddenTitle')}
        description={tConfig('forbiddenDesc')}
      />
    )
  }

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
