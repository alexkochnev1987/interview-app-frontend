import { Suspense } from 'react'

import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { TemplatesListClient } from '@/components/templates/templates-list-client'
import { TemplatesListHeader } from '@/components/templates/templates-list-header'
import { CardGrid } from '@/components/ui/layout/card-grid'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'
import { Skeleton } from '@/components/ui/skeleton'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { requireAuthGate } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchTemplatesList } from '@/lib/templates-prefetch'

interface TemplatesPageProps {
  params: Promise<{ locale: Locale }>
}

async function TemplatesData({ params }: { params: TemplatesPageProps['params'] }) {
  const { locale } = await params
  const { ctx } = await requireAuthGate(canConfigureInterview, routes.templates.list, locale)
  const dehydratedState = await prefetchTemplatesList(ctx)

  return (
    <QueryHydrationBoundary state={dehydratedState}>
      <TemplatesListClient />
    </QueryHydrationBoundary>
  )
}

function TemplatesListSkeleton() {
  return (
    <Stack gap={6}>
      <Inline justify="between" align="center" gap={3} wrap="wrap">
        <Inline grow="fill">
          <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
        </Inline>
        <Inline gap={2} align="center">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </Inline>
      </Inline>

      <Inline gap={3} align="center">
        <Skeleton className="h-7 w-36 rounded-md" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </Inline>

      <CardGrid>
        {Array.from({ length: 6 }).map((_, i) => (
          // oxlint-disable-next-line react/no-array-index-key
          <div
            key={i}
            className="rounded-2xl border border-hairline bg-surface-low-glass p-5 space-y-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-6 w-44 rounded-md" />
              <Skeleton className="h-4 w-full rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface-low-soft p-3 space-y-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-6 w-8 rounded" />
              </div>
              <div className="rounded-2xl bg-surface-low-soft p-3 space-y-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-6 w-8 rounded" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-hairline">
              <Skeleton className="h-8 w-20 rounded-pill" />
              <Skeleton className="h-8 w-24 rounded-pill" />
            </div>
          </div>
        ))}
      </CardGrid>
    </Stack>
  )
}

export default function TemplatesPage({ params }: TemplatesPageProps) {
  return (
    <PageShell>
      <Stack gap={6}>
        <TemplatesListHeader />
        <Suspense fallback={<TemplatesListSkeleton />}>
          <TemplatesData params={params} />
        </Suspense>
      </Stack>
    </PageShell>
  )
}
