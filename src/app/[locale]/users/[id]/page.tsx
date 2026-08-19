import { getTranslations } from 'next-intl/server'

import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import { ProfileView } from '@/features/profile/profile-view'
import type { Locale } from '@/i18n/locales'
import { type TeamMember } from '@/lib/api'
import { isApiError } from '@/lib/api-error'
import { enforcePageAuth, redirectIfUnauthorizedError } from '@/lib/auth-gate'
import { requestServer } from '@/lib/server-fetch'
import { canViewUserProfile } from '@/lib/user-profile-access'

interface UserProfilePageProps {
  params: Promise<{ locale: Locale; id: string }>
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.profile' })
  const returnPath = `/users/${id}`

  const auth = await enforcePageAuth({
    roleCheck: () => true,
    locale,
    returnPath,
    gateNamespace: 'toast.pageGate.profile',
    backHref: '/',
  })
  if (!auth.authorized) return auth.fallback

  let user: TeamMember | null = null
  let error: string | null = null

  try {
    user = (await requestServer<TeamMember>(`/users/${encodeURIComponent(id)}`, auth.ctx)) ?? null
  } catch (err) {
    redirectIfUnauthorizedError(err, returnPath, locale)
    if (isApiError(err) && err.status === 404) {
      return (
        <FlashErrorPageFallback title={t('loadFailedTitle')} description={t('notFoundFallback')} />
      )
    }
    error = err instanceof Error ? err.message : t('loadFailedFallback')
  }

  if (error || !user) {
    return (
      <FlashErrorPageFallback
        title={t('loadFailedTitle')}
        description={error ?? t('notFoundFallback')}
      />
    )
  }

  if (
    !canViewUserProfile({ id: user.id, role: user.role }, { id: auth.me.id, role: auth.me.role })
  ) {
    return (
      <ForbiddenAccessPage title={t('forbiddenTitle')} description={t('forbiddenDescription')} />
    )
  }

  const mode = auth.me.id === user.id ? 'self' : 'member'

  return (
    <PageShell>
      <ProfileView user={user} mode={mode} />
    </PageShell>
  )
}
