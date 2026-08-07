import { Suspense } from 'react'

import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { TemplatesListClient } from '@/components/templates/templates-list-client'
import { PageShell } from '@/components/ui/layout/page-shell'
import { TableSkeleton } from '@/components/ui/skeleton'
import { routes } from '@/i18n/routes'
import { requireAuthGate } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchTemplatesList } from '@/lib/templates-prefetch'

async function TemplatesData() {
  const { ctx } = await requireAuthGate(canConfigureInterview, routes.templates.list)
  const dehydratedState = await prefetchTemplatesList(ctx)

  return (
    <QueryHydrationBoundary state={dehydratedState}>
      <TemplatesListClient />
    </QueryHydrationBoundary>
  )
}

export default function TemplatesPage() {
  return (
    <PageShell>
      <Suspense fallback={<TableSkeleton />}>
        <TemplatesData />
      </Suspense>
    </PageShell>
  )
}
