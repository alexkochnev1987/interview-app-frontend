'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { questionsRootQueryKey } from '@/components/questions/picker/query-keys'
import {
  createQuestion,
  deleteQuestion,
  deleteQuestionsBulk,
  restoreQuestion,
  updateQuestion,
  type QuestionInput,
  type UpdateQuestionInput,
} from '@/lib/api'
import { getErrorMessage } from '@/lib/api-error'
import { BULK_DELETE_TOAST_IDS, notifyBulkDeleteOutcome } from '@/lib/notify-bulk-delete'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useToastMessages } from '@/lib/use-toast-messages'

type QuestionMutationErrorTitle = string | ((error: unknown) => string)

function useInvalidateQuestions() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: questionsRootQueryKey() })
  }, [queryClient])
}

function notifyMutationSuccess(message: string) {
  notifySuccess(message)
}

function useQuestionMutationResources() {
  const invalidateQuestions = useInvalidateQuestions()
  const toastMessages = useToastMessages()

  const notifyMutationError = (title: string, error: unknown, options?: { id?: string }) => {
    notifyError(title, {
      id: options?.id,
      description: getErrorMessage(error, toastMessages.defaults.error),
    })
  }

  return {
    toastMessages,
    invalidateQuestions,
    notifyMutationError,
    notifyMutationSuccess,
  }
}

type BuildQuestionMutationOptionsConfig<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>
  successMessage?: string
  errorTitle: QuestionMutationErrorTitle
  notifyOnSuccess?: boolean
  notifyOnError?: boolean
}

export function buildQuestionMutationOptions<TData, TVariables>(
  resources: ReturnType<typeof useQuestionMutationResources>,
  config: BuildQuestionMutationOptionsConfig<TData, TVariables>,
) {
  const {
    invalidateQuestions,
    notifyMutationError,
    notifyMutationSuccess: notifySuccessFn,
  } = resources

  return {
    mutationFn: config.mutationFn,
    onSuccess: () => {
      invalidateQuestions()
      if (config.notifyOnSuccess !== false && config.successMessage) {
        notifySuccessFn(config.successMessage)
      }
    },
    onError: (error: unknown) => {
      if (config.notifyOnError === false) return

      const title =
        typeof config.errorTitle === 'function' ? config.errorTitle(error) : config.errorTitle

      notifyMutationError(title, error)
    },
  }
}

export function useCreateQuestion() {
  const invalidateQuestions = useInvalidateQuestions()

  return useMutation({
    mutationFn: (value: QuestionInput) => createQuestion(value),
    onSuccess: invalidateQuestions,
  })
}

export function useUpdateQuestion() {
  const resources = useQuestionMutationResources()

  const { invalidateQuestions } = resources

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: UpdateQuestionInput }) =>
      updateQuestion(id, value),
    onSuccess: () => {
      invalidateQuestions()
    },
  })
}

export function useDeleteQuestion() {
  const resources = useQuestionMutationResources()

  return useMutation(
    buildQuestionMutationOptions(resources, {
      mutationFn: deleteQuestion,
      errorTitle: resources.toastMessages.question.deleteError,
      notifyOnSuccess: false,
      notifyOnError: false,
    }),
  )
}

export function useRestoreQuestion() {
  const resources = useQuestionMutationResources()

  return useMutation(
    buildQuestionMutationOptions(resources, {
      mutationFn: restoreQuestion,
      errorTitle: resources.toastMessages.question.restoreError,
      notifyOnSuccess: false,
      notifyOnError: false,
    }),
  )
}

export function buildBulkDeleteMutationOptions(
  resources: ReturnType<typeof useQuestionMutationResources>,
) {
  const { toastMessages, invalidateQuestions, notifyMutationError } = resources

  return {
    mutationFn: deleteQuestionsBulk,
    onSuccess: (result: Awaited<ReturnType<typeof deleteQuestionsBulk>>) => {
      invalidateQuestions()
      notifyBulkDeleteOutcome(result, toastMessages.bulkDelete)
    },
    onError: (error: unknown) => {
      notifyMutationError(toastMessages.bulkDelete.failedTitle, error, {
        id: BULK_DELETE_TOAST_IDS.error,
      })
    },
  }
}

export function useBulkDeleteQuestions() {
  const resources = useQuestionMutationResources()

  return useMutation(buildBulkDeleteMutationOptions(resources))
}
