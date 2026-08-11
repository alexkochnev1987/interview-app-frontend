import { Suspense } from 'react'

import { TeamMemberStats } from '@/components/team/team-member-stats'
import { TeamMembersHeading } from '@/components/team/team-members-heading'
import { Card, CardContent } from '@/components/ui/card'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'
import { Skeleton } from '@/components/ui/skeleton'
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

function TeamPageSkeleton() {
  return (
    <Stack gap={6}>
      <TeamMemberStats />
      <Card variant="surface" flexChild="contain">
        <CardContent spacing="sm">
          <div className="flex items-center justify-between gap-4 py-2">
            <Skeleton className="h-10 w-full max-w-xs rounded-xl" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
          </div>

          <div className="w-full space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              // oxlint-disable-next-line react/no-array-index-key
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default function TeamPage({ params }: TeamPageProps) {
  return (
    <PageShell>
      <Stack gap={6}>
        <TeamMembersHeading />
        <Suspense fallback={<TeamPageSkeleton />}>
          <TeamData params={params} />
        </Suspense>
      </Stack>
    </PageShell>
  )
}
