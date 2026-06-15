import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BULK_DELETE_TOAST_IDS, notifyBulkDeleteOutcome } from '@/lib/notify-bulk-delete'
import { notifyInfo, notifySuccess } from '@/lib/toast'

vi.mock('@/lib/toast', () => ({
  notifyInfo: vi.fn(),
  notifySuccess: vi.fn(),
}))

const messages = {
  partialTitle: (deletedCount: number, blockedCount: number) =>
    `Deleted ${deletedCount}, blocked ${blockedCount}`,
  noopTitle: 'No questions deleted',
  noopDescription: 'Nothing was removed.',
  successTitle: (count: number) => `Deleted ${count}`,
  successDescription: 'Library updated.',
}

describe('notifyBulkDeleteOutcome', () => {
  beforeEach(() => {
    vi.mocked(notifyInfo).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

  it('shows partial outcome when some deletes are blocked', () => {
    notifyBulkDeleteOutcome(
      { deleted: ['q-1'], blocked: [{ id: 'q-2', questionText: 'Q2', reason: 'in use' }] },
      messages,
    )

    expect(notifyInfo).toHaveBeenCalledWith('Deleted 1, blocked 1', {
      id: BULK_DELETE_TOAST_IDS.partial,
    })
    expect(notifySuccess).not.toHaveBeenCalled()
  })

  it('shows noop outcome when nothing was deleted', () => {
    notifyBulkDeleteOutcome({ deleted: [], blocked: [] }, messages)

    expect(notifyInfo).toHaveBeenCalledWith('No questions deleted', {
      id: BULK_DELETE_TOAST_IDS.noop,
      description: 'Nothing was removed.',
    })
  })

  it('shows success outcome when deletes succeed', () => {
    notifyBulkDeleteOutcome({ deleted: ['q-1', 'q-2'], blocked: [] }, messages)

    expect(notifySuccess).toHaveBeenCalledWith('Deleted 2', {
      id: BULK_DELETE_TOAST_IDS.success,
      description: 'Library updated.',
    })
  })
})
