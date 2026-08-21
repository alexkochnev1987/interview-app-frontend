import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { ConfigDashboard } from '@/components/config/config-dashboard'
import type { Locale } from '@/i18n/locales'
import type { SystemConfigEntry } from '@/lib/api'
import { enforcePageAuth } from '@/lib/auth-gate'
import { isSuperAdmin } from '@/lib/auth-roles'
import { requestServer } from '@/lib/server-fetch'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'config' })

  return {
    title: t('title'),
    description: t('lead'),
  }
}

export default async function ConfigPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const auth = await enforcePageAuth({
    roleCheck: isSuperAdmin,
    locale,
    returnPath: '/config',
    gateNamespace: 'config',
    backHref: '/',
  })
  if (!auth.authorized) return auth.fallback

  let initialConfigs: SystemConfigEntry[] = []
  try {
    const fetched = await requestServer<SystemConfigEntry[]>('/config', auth.ctx)
    if (fetched) {
      initialConfigs = fetched
    }
  } catch {
    // If backend is unavailable or endpoint is not ready, start with empty list
    initialConfigs = []
  }

  return <ConfigDashboard initialConfigs={initialConfigs} />
}
