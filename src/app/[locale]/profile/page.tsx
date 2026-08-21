import { PageShell } from '@/components/ui/layout/page-shell'
import { ProfileView } from '@/features/profile/profile-view'
import type { Locale } from '@/i18n/locales'
import { enforcePageAuth } from '@/lib/auth-gate'

interface ProfilePageProps {
  params: Promise<{ locale: Locale }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params
  const auth = await enforcePageAuth({
    roleCheck: () => true,
    locale,
    returnPath: '/profile',
    gateNamespace: 'toast.pageGate.profile',
    backHref: '/',
  })
  if (!auth.authorized) return auth.fallback

  return (
    <PageShell>
      <ProfileView user={auth.me} />
    </PageShell>
  )
}
