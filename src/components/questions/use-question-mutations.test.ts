import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildBulkDeleteMutationOptions,
  buildQuestionMutationOptions,
} from '@/components/questions/use-question-mutations'
import { getDeleteQuestionErrorTitle, QuestionInUseError } from '@/lib/api-error'
import { notifyBulkDeleteOutcome } from '@/lib/notify-bulk-delete'

vi.mock('@/lib/notify-bulk-delete', () => ({
  notifyBulkDeleteOutcome: vi.fn(),
}))

type MutationResources = Parameters<typeof buildQuestionMutationOptions>[0]

function makeResources(): MutationResources {
  return {
    toastMessages: {
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
        cannotDeleteTitle: 'Cannot delete',
      },
      defaults: {
        error: 'Something went wrong',
      },
      bulkDelete: {
        failedTitle: 'Bulk delete failed',
        partialTitle: (deletedCount: number, blockedCount: number) =>
          `Deleted ${deletedCount}, blocked ${blockedCount}`,
        noopTitle: 'No questions deleted',
        noopDescription: 'Nothing was removed.',
        successTitle: (count: number) => `Deleted ${count}`,
        successDescription: 'Library updated.',
      },
    },
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
      errorTitle: (error) =>
        getDeleteQuestionErrorTitle(
          error,
          resources.toastMessages.question.deleteError,
          resources.toastMessages.deleteQuestion.cannotDeleteTitle,
        ),
    })

    options.onSuccess()

    expect(resources.invalidateQuestions).toHaveBeenCalledOnce()
    expect(resources.notifyMutationSuccess).toHaveBeenCalledWith('Deleted')
  })

  it('delete error maps in-use conflicts to the dedicated title', () => {
    const options = buildQuestionMutationOptions(resources, {
      mutationFn: vi.fn(),
      successMessage: resources.toastMessages.question.deleteSuccess,
      errorTitle: (error) =>
        getDeleteQuestionErrorTitle(
          error,
          resources.toastMessages.question.deleteError,
          resources.toastMessages.deleteQuestion.cannotDeleteTitle,
        ),
    })
    const error = new QuestionInUseError('Question is in use')

    options.onError(error)

    expect(resources.notifyMutationError).toHaveBeenCalledWith('Cannot delete', error)
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
    const result = { deleted: ['q-1'], blocked: [] }

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
      { id: 'bulk-delete-error' },
    )
  })
})
