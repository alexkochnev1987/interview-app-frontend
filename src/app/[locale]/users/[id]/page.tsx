import { forbidden } from 'next/navigation'
import { Suspense } from 'react'

import { PageShell } from '@/components/ui/layout/page-shell'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { ProfileView } from '@/features/profile/profile-view'
import { type TeamMember } from '@/lib/api'
import { requireAuthGate } from '@/lib/auth-gate'
import { requestServer } from '@/lib/server-fetch'
import { canViewUserProfile } from '@/lib/user-profile-access'

interface UserProfilePageProps {
  params: Promise<{ id: string }>
}

async function UserProfileData({ params }: UserProfilePageProps) {
  const { id } = await params
  const { ctx, me } = await requireAuthGate(() => true, `/users/${id}`)
  const user = await requestServer<TeamMember>(`/users/${encodeURIComponent(id)}`, ctx)

  if (!user || !canViewUserProfile({ id: user.id, role: user.role }, { id: me.id, role: me.role })) {
    forbidden()
  }

  const mode = me.id === user.id ? 'self' : 'member'

  return <ProfileView user={user} mode={mode} />
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return (
    <PageShell>
      <Suspense fallback={<DetailPageSkeleton />}>
        <UserProfileData params={params} />
      </Suspense>
    </PageShell>
  )
}
