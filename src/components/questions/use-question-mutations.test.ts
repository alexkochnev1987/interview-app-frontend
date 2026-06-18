import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildBulkDeleteMutationOptions,
  buildQuestionMutationOptions,
} from '@/components/questions/use-question-mutations'
import {
  BULK_DELETE_TOAST_IDS,
  notifyBulkDeleteOutcome,
} from '@/lib/notify-bulk-delete'
import type { useToastMessages } from '@/lib/use-toast-messages'

vi.mock('@/lib/notify-bulk-delete', async () => {
  const actual = await vi.importActual<typeof import('@/lib/notify-bulk-delete')>(
    '@/lib/notify-bulk-delete',
  )

  return {
    ...actual,
    notifyBulkDeleteOutcome: vi.fn(),
  }
})

type MutationResources = Parameters<typeof buildQuestionMutationOptions>[0]
type ToastMessages = ReturnType<typeof useToastMessages>

function makeResources(): MutationResources {
  const toastMessages = {
    question: {
      createSuccess: 'Created',
      createError: 'Create failed',
      saveSuccess: 'Saved',
      saveError: 'Save failed',
      deleteSuccess: 'Deleted',
      deleteError: 'Delete failed',
      restoreSuccess: 'Restored',
      restoreError: 'Restore failed',
    },
    deleteQuestion: {
      scheduledTitle: 'Deletion scheduled',
      scheduledIntro: 'Deletion will run once active interviews finish.',
    },
    defaults: {
      success: 'Done',
      error: 'Something went wrong',
      info: 'Notice',
      actionCompleted: 'Action completed',
      actionFailed: 'Action failed',
    },
    bulkDelete: {
      failedTitle: 'Bulk delete failed',
      partialTitle: (deletedCount: number, scheduledCount: number) =>
        `Deleted ${deletedCount}, scheduled ${scheduledCount}`,
      noopTitle: 'No questions deleted',
      noopDescription: 'Nothing was removed.',
      successTitle: (count: number) => `Deleted ${count}`,
      successDescription: 'Library updated.',
      scheduledIntro: 'These questions are still used by active interviews.',
    },
  } as ToastMessages

  return {
    toastMessages,
    invalidateQuestions: vi.fn(),
    notifyMutationSuccess: vi.fn(),
    notifyMutationError: vi.fn(),
  }
}

describe('buildQuestionMutationOptions', () => {
  let resources: MutationResources

  beforeEach(() => {
    resources = makeResources()
    vi.mocked(notifyBulkDeleteOutcome).mockReset()
  })

  it('create success invalidates and shows success toast', () => {
    const options = buildQuestionMutationOptions(resources, {
      mutationFn: vi.fn(),
      successMessage: resources.toastMessages.question.createSuccess,
      errorTitle: resources.toastMessages.question.createError,
    })

    options.onSuccess()

    expect(resources.invalidateQuestions).toHaveBeenCalledOnce()
    expect(resources.notifyMutationSuccess).toHaveBeenCalledWith('Created')
  })

  it('create error shows error toast', () => {
    const options = buildQuestionMutationOptions(resources, {
      mutationFn: vi.fn(),
      successMessage: resources.toastMessages.question.createSuccess,
      errorTitle: resources.toastMessages.question.createError,
    })
    const error = new Error('Create failed')

    options.onError(error)

    expect(resources.notifyMutationError).toHaveBeenCalledWith('Create failed', error)
  })

  it('update success invalidates and shows success toast', () => {
    const options = buildQuestionMutationOptions(resources, {
      mutationFn: vi.fn(),
      successMessage: resources.toastMessages.question.saveSuccess,
      errorTitle: resources.toastMessages.question.saveError,
    })

    options.onSuccess()

    expect(resources.invalidateQuestions).toHaveBeenCalledOnce()
    expect(resources.notifyMutationSuccess).toHaveBeenCalledWith('Saved')
  })

  it('update error shows error toast', () => {
    const options = buildQuestionMutationOptions(resources, {
      mutationFn: vi.fn(),
      successMessage: resources.toastMessages.question.saveSuccess,
      errorTitle: resources.toastMessages.question.saveError,
    })
    const error = new Error('Save failed')

    options.onError(error)

    expect(resources.notifyMutationError).toHaveBeenCalledWith('Save failed', error)
  })

  it('delete success invalidates and shows success toast', () => {
    const options = buildQuestionMutationOptions(resources, {
      mutationFn: vi.fn(),
      successMessage: resources.toastMessages.question.deleteSuccess,
      errorTitle: resources.toastMessages.question.deleteError,
    })

    options.onSuccess()

    expect(resources.invalidateQuestions).toHaveBeenCalledOnce()
    expect(resources.notifyMutationSuccess).toHaveBeenCalledWith('Deleted')
  })

  it('delete error shows error toast', () => {
    const options = buildQuestionMutationOptions(resources, {
      mutationFn: vi.fn(),
      successMessage: resources.toastMessages.question.deleteSuccess,
      errorTitle: resources.toastMessages.question.deleteError,
    })
    const error = new Error('Delete failed')

    options.onError(error)

    expect(resources.notifyMutationError).toHaveBeenCalledWith('Delete failed', error)
  })

  it('restore success invalidates and shows success toast', () => {
    const options = buildQuestionMutationOptions(resources, {
      mutationFn: vi.fn(),
      successMessage: resources.toastMessages.question.restoreSuccess,
      errorTitle: resources.toastMessages.question.restoreError,
    })

    options.onSuccess()

    expect(resources.invalidateQuestions).toHaveBeenCalledOnce()
    expect(resources.notifyMutationSuccess).toHaveBeenCalledWith('Restored')
  })

  it('restore error shows error toast', () => {
    const options = buildQuestionMutationOptions(resources, {
      mutationFn: vi.fn(),
      successMessage: resources.toastMessages.question.restoreSuccess,
      errorTitle: resources.toastMessages.question.restoreError,
    })
    const error = new Error('Restore failed')

    options.onError(error)

    expect(resources.notifyMutationError).toHaveBeenCalledWith('Restore failed', error)
  })
})

describe('buildBulkDeleteMutationOptions', () => {
  let resources: MutationResources

  beforeEach(() => {
    resources = makeResources()
    vi.mocked(notifyBulkDeleteOutcome).mockReset()
  })

  it('success invalidates and delegates bulk outcome handling', () => {
    const options = buildBulkDeleteMutationOptions(resources)
    const result = { deleted: ['q-1'], scheduled: [] }

    options.onSuccess(result)

    expect(resources.invalidateQuestions).toHaveBeenCalledOnce()
    expect(notifyBulkDeleteOutcome).toHaveBeenCalledWith(
      result,
      resources.toastMessages.bulkDelete,
    )
  })

  it('error uses stable toast id for retries', () => {
    const options = buildBulkDeleteMutationOptions(resources)
    const error = new Error('Bulk delete failed')

    options.onError(error)

    expect(resources.notifyMutationError).toHaveBeenCalledWith(
      'Bulk delete failed',
      error,
      { id: BULK_DELETE_TOAST_IDS.error },
    )
  })
})
