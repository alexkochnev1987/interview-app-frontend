import { Suspense } from 'react'

import { PageShell } from '@/components/ui/layout/page-shell'
import { TableSkeleton } from '@/components/ui/skeleton'
import { TeamMembersContainer } from '@/features/team/team-members-container'
import { type TeamMember } from '@/lib/api'
import { requireAuthGate } from '@/lib/auth-gate'
import { canManageTeam } from '@/lib/auth-roles'
import { requestServer } from '@/lib/server-fetch'

async function TeamData() {
  const { ctx } = await requireAuthGate(canManageTeam, '/team')
  const members = (await requestServer<TeamMember[]>('/users', ctx)) ?? []

  return <TeamMembersContainer initialMembers={members} />
}

export default function TeamPage() {
  return (
    <PageShell>
      <Suspense fallback={<TableSkeleton />}>
        <TeamData />
      </Suspense>
    </PageShell>
  )
}
