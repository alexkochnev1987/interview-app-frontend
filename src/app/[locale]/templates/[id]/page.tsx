import { forbidden } from 'next/navigation'
import { Suspense } from 'react'

import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { TemplateForm } from '@/components/templates/template-form'
import { PageShell } from '@/components/ui/layout/page-shell'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { routes } from '@/i18n/routes'
import { requireAuthGate } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchInterviewCreatePicker } from '@/lib/questions-library-prefetch'
import { fetchTemplate } from '@/lib/templates-prefetch'

interface EditTemplatePageProps {
  params: Promise<{ id: string }>
}

async function EditTemplateData({ params }: EditTemplatePageProps) {
  const { id } = await params
  const { ctx } = await requireAuthGate(canConfigureInterview, routes.templates.detail(id))

  const [initialPrefetch, template] = await Promise.all([
    prefetchInterviewCreatePicker(ctx),
    fetchTemplate(ctx, id),
  ])

  if (!template) {
    forbidden()
  }

  return (
    <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
      <TemplateForm initialPrefetch={initialPrefetch} template={template} />
    </QueryHydrationBoundary>
  )
}

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  return (
    <PageShell>
      <Suspense fallback={<DetailPageSkeleton />}>
        <EditTemplateData params={params} />
      </Suspense>
    </PageShell>
  )
}
