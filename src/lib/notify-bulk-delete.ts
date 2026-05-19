import { type BulkDeleteResult } from '@/lib/api'
import { notifyInfo, notifySuccess } from '@/lib/toast'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

export function notifyBulkDeleteOutcome(result: BulkDeleteResult) {
  if (result.blocked.length > 0) {
    notifyInfo(
      TOAST_MESSAGES.bulkDelete.partialTitle(
        result.deleted.length,
        result.blocked.length,
      ),
      { id: 'bulk-delete-partial' },
    )
    return
  }

  if (result.deleted.length === 0) {
    notifyInfo(TOAST_MESSAGES.bulkDelete.noopTitle, {
      id: 'bulk-delete-noop',
      description: TOAST_MESSAGES.bulkDelete.noopDescription,
    })
    return
  }

  notifySuccess(TOAST_MESSAGES.bulkDelete.successTitle(result.deleted.length), {
    id: 'bulk-delete-success',
    description: TOAST_MESSAGES.bulkDelete.successDescription,
  })
}
