import { useCallback } from 'react'
import { useTranslations } from 'next-intl'

import type { ActiveInterviewFilterChipDescriptor } from '@/components/interviews/picker/build-active-chips'
import { useHrUsers } from '@/components/interviews/hooks/use-hr-users'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { useAuth } from '@/lib/auth-context'
import { canAssignInterviewHr } from '@/lib/auth-roles'
import type { InterviewStatusFilter } from '@/lib/api'
import { isAssignedHrFilterUnassigned } from '@/lib/assigned-hr-filter'

export function useInterviewChipLabels(options?: { needsHrUserLookup?: boolean }) {
  const t = useTranslations('interviews.chips')
  const sharedLabels = useSharedLabels()
  const { user } = useAuth()
  const canAssign = canAssignInterviewHr(user?.role)
  const needsHrUserLookup = options?.needsHrUserLookup ?? false
  const { hrUsers, loading: hrUsersLoading } = useHrUsers({
    enabled: canAssign && needsHrUserLookup,
  })

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
        case 'assignedHr': {
          if (isAssignedHrFilterUnassigned(descriptor.value)) {
            return t('hrUnassigned')
          }
          const name = hrUsers.find((hr) => hr.id === descriptor.value)?.name
          if (name) {
            return t('hr', { value: name })
          }
          if (hrUsersLoading) {
            return t('hrLoading')
          }
          return t('hr', { value: descriptor.label })
        }
        default:
          return ''
      }
    },
    [hrUsers, hrUsersLoading, sharedLabels, t],
  )
}
