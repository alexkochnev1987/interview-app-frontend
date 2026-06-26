import { type BulkDeleteResult } from '@/lib/api'
import { notifyInfo, notifySuccess } from '@/lib/toast'

export const BULK_DELETE_TOAST_IDS = {
  error: 'bulk-delete-error',
  partial: 'bulk-delete-partial',
  noop: 'bulk-delete-noop',
  success: 'bulk-delete-success',
} as const

type BulkDeleteToastMessages = {
  partialTitle: (deletedCount: number, scheduledCount: number) => string
  noopTitle: string
  noopDescription: string
  successTitle: (count: number) => string
  successDescription: string
}

export function notifyBulkDeleteOutcome(
  result: BulkDeleteResult,
  messages: BulkDeleteToastMessages,
) {
  if (result.scheduled.length > 0) {
    notifyInfo(
      messages.partialTitle(
        result.deleted.length,
        result.scheduled.length,
      ),
      { id: BULK_DELETE_TOAST_IDS.partial },
    )
    return
  }

  if (result.deleted.length === 0) {
    notifyInfo(messages.noopTitle, {
      id: BULK_DELETE_TOAST_IDS.noop,
      description: messages.noopDescription,
    })
    return
  }

  notifySuccess(messages.successTitle(result.deleted.length), {
    id: BULK_DELETE_TOAST_IDS.success,
    description: messages.successDescription,
  })
}
