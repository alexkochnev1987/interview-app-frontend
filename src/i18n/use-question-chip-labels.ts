import { useCallback } from 'react'
import { useTranslations } from 'next-intl'

import type { ActiveFilterChipDescriptor } from '@/components/questions/picker/build-active-chips'
import { useSharedLabels } from '@/i18n/use-shared-labels'

export function useQuestionChipLabels() {
  const t = useTranslations('questions.chips')
  const sharedLabels = useSharedLabels()

  return useCallback(
    (descriptor: ActiveFilterChipDescriptor) => {
      switch (descriptor.kind) {
        case 'difficulty':
          return t('difficulty', { value: sharedLabels.difficulty(descriptor.value) })
        case 'category':
          return t('category', { value: descriptor.value })
        case 'subcategory':
          return t('subcategory', { value: descriptor.value })
        case 'role':
          return t('role', { value: descriptor.value })
        case 'tag':
          return t('tag', { tag: descriptor.value })
        case 'status':
          return descriptor.value === 'inactive'
            ? t('statusDeletedOnly')
            : t('statusActiveDeleted')
        default:
          return ''
      }
    },
    [sharedLabels, t],
  )
}
