import { Suspense } from 'react'

import { PageShell } from '@/components/ui/layout/page-shell'
import { TableSkeleton } from '@/components/ui/skeleton'
import { TeamMembersContainer } from '@/features/team/team-members-container'
import type { Locale } from '@/i18n/locales'
import { type TeamMember } from '@/lib/api'
import { requireAuthGate } from '@/lib/auth-gate'
import { canManageTeam } from '@/lib/auth-roles'
import { requestServer } from '@/lib/server-fetch'

interface TeamPageProps {
  params: Promise<{ locale: Locale }>
}

async function TeamData({ params }: { params: TeamPageProps['params'] }) {
  const { locale } = await params
  const { ctx } = await requireAuthGate(canManageTeam, '/team', locale)
  const members = (await requestServer<TeamMember[]>('/users', ctx)) ?? []

  return <TeamMembersContainer initialMembers={members} />
}

export default function TeamPage({ params }: TeamPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<TableSkeleton />}>
        <TeamData params={params} />
      </Suspense>
    </PageShell>
  )
}
