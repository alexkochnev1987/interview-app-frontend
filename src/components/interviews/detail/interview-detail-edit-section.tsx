'use client'

import { InterviewEditPanel } from '@/components/interviews/interview-edit-panel'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { type Interview } from '@/lib/api'
import type { QuestionsLibraryPrefetch } from '@/lib/questions-library-prefetch'

type InterviewDetailEditSectionProps = {
  interview: Interview
  editPickerPrefetch: QuestionsLibraryPrefetch | null
  onSaved: (updated: Interview) => void
  onExitEdit: () => void
}

export function InterviewDetailEditSection({
  interview,
  editPickerPrefetch,
  onSaved,
  onExitEdit,
}: InterviewDetailEditSectionProps) {
  const panel = (
    <InterviewEditPanel
      key={`${interview.id}-${interview.updatedAt}`}
      interview={interview}
      initialPrefetch={editPickerPrefetch ?? undefined}
      onSaved={onSaved}
      onExitEdit={onExitEdit}
    />
  )

  if (!editPickerPrefetch) {
    return panel
  }

  return (
    <QueryHydrationBoundary state={editPickerPrefetch.dehydratedState}>
      {panel}
    </QueryHydrationBoundary>
  )
}
