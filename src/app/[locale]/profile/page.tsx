import { getTranslations } from 'next-intl/server'

import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { PageShell } from '@/components/ui/layout/page-shell'
import { ProfileView } from '@/features/profile/profile-view'
import type { Locale } from '@/i18n/locales'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
} from '@/lib/auth-gate'

interface ProfilePageProps {
  params: Promise<{ locale: Locale }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const auth = await loadAuthGate(() => true, locale)
  redirectIfUnauthenticated(auth, '/profile', locale)

  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title={tCommon('profileLoadFailed')}
        description={auth.message}
      />
    )
  }

  if (auth.kind !== 'authorized') {
    return (
      <FlashErrorPageFallback
        title={tCommon('profileLoadFailed')}
        description={tCommon('sessionVerificationFailed')}
      />
    )
  }

  return (
    <PageShell>
      <ProfileView user={auth.me} />
    </PageShell>
  )
}
