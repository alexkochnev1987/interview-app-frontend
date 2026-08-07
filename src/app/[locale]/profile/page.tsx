import { Suspense } from 'react'

import { PageShell } from '@/components/ui/layout/page-shell'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { ProfileView } from '@/features/profile/profile-view'
import { requireAuthGate } from '@/lib/auth-gate'

async function ProfileData() {
  const { me } = await requireAuthGate(() => true, '/profile')

  return <ProfileView user={me} />
}

export default function ProfilePage() {
  return (
    <PageShell>
      <Suspense fallback={<DetailPageSkeleton />}>
        <ProfileData />
      </Suspense>
    </PageShell>
  )
}
