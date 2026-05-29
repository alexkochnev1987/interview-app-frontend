import { type BulkDeleteResult } from '@/lib/api'
import { notifyInfo, notifySuccess } from '@/lib/toast'

type BulkDeleteToastMessages = {
  partialTitle: (deletedCount: number, blockedCount: number) => string
  noopTitle: string
  noopDescription: string
  successTitle: (count: number) => string
  successDescription: string
}

export function notifyBulkDeleteOutcome(
  result: BulkDeleteResult,
  messages: BulkDeleteToastMessages,
) {
  if (result.blocked.length > 0) {
    notifyInfo(
      messages.partialTitle(
        result.deleted.length,
        result.blocked.length,
      ),
      { id: 'bulk-delete-partial' },
    )
    return
  }

  if (result.deleted.length === 0) {
    notifyInfo(messages.noopTitle, {
      id: 'bulk-delete-noop',
      description: messages.noopDescription,
    })
    return
  }

  notifySuccess(messages.successTitle(result.deleted.length), {
    id: 'bulk-delete-success',
    description: messages.successDescription,
  })
}
