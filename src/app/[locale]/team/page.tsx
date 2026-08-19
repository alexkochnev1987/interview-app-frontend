import { getTranslations } from 'next-intl/server'

import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import { TeamMembersContainer } from '@/features/team/team-members-container'
import type { Locale } from '@/i18n/locales'
import { type TeamMember } from '@/lib/api'
import { enforcePageAuth, redirectIfUnauthorizedError } from '@/lib/auth-gate'
import { canManageTeam } from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

interface TeamPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.team' })
  const auth = await enforcePageAuth({
    roleCheck: canManageTeam,
    locale,
    returnPath: '/team',
    gateNamespace: 'toast.pageGate.team',
    backHref: '/',
    backLabelKey: 'backToDashboard',
  })
  if (!auth.authorized) return auth.fallback

  let members: TeamMember[] = []
  let error: string | null = null

  try {
    members = (await requestServer<TeamMember[]>('/users', auth.ctx)) ?? []
  } catch (err) {
    redirectIfUnauthorizedError(err, '/team', locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage title={t('forbiddenTitle')} description={t('forbiddenDescription')} />
      )
    }
    error = err instanceof Error ? err.message : t('loadFailedFallback')
  }

  if (error) {
    return <FlashErrorPageFallback title={t('loadFailedTitle')} description={error} />
  }

  return (
    <PageShell>
      <TeamMembersContainer initialMembers={members} />
    </PageShell>
  )
}
