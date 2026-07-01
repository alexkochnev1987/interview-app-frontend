import { useCallback } from 'react'
import { useTranslations } from 'next-intl'

import type { ActiveInterviewFilterChipDescriptor } from '@/components/interviews/picker/build-active-chips'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import type { InterviewStatusFilter } from '@/lib/api'

export function useInterviewChipLabels() {
  const t = useTranslations('interviews.chips')
  const sharedLabels = useSharedLabels()

  return useCallback(
    (descriptor: ActiveInterviewFilterChipDescriptor) => {
      switch (descriptor.kind) {
        case 'position':
          return t('position', { value: descriptor.value })
        case 'status':
          return t('status', {
            value: sharedLabels.interviewStatus(
              descriptor.value as InterviewStatusFilter,
            ),
          })
        default:
          return ''
      }
    },
    [sharedLabels, t],
  )
}
