'use client'

import { useCallback } from 'react'
import {
  useMutation,
  useQueryClient,
  type MutationFunctionContext,
} from '@tanstack/react-query'

import { questionsRootQueryKey } from '@/components/questions/picker/query-keys'
import {
  createQuestion,
  deleteQuestion,
  deleteQuestionsBulk,
  restoreQuestion,
  updateQuestion,
  type QuestionInput,
} from '@/lib/api'
import { getDeleteQuestionErrorTitle, getErrorMessage } from '@/lib/api-error'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useToastMessages } from '@/lib/use-toast-messages'

export type MutationToastMeta = {
  hideSuccess?: boolean
  hideError?: boolean
}

function getToastMetaFromContext(
  context: MutationFunctionContext,
): MutationToastMeta | undefined {
  return context.meta as MutationToastMeta | undefined
}

function useQuestionMutationToasts() {
  const toastMessages = useToastMessages()

  const notifyMutationError = (
    title: string,
    error: unknown,
    meta?: MutationToastMeta,
  ) => {
    if (meta?.hideError) return
    notifyError(title, { description: getErrorMessage(error) })
  }

  const notifyMutationSuccess = (
    message: string,
    meta?: MutationToastMeta,
  ) => {
    if (meta?.hideSuccess) return
    notifySuccess(message)
  }

  return { toastMessages, notifyMutationError, notifyMutationSuccess }
}

function useInvalidateQuestions() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: questionsRootQueryKey() })
  }, [queryClient])
}

export function useCreateQuestion() {
  const invalidateQuestions = useInvalidateQuestions()

  const { toastMessages, notifyMutationError, notifyMutationSuccess } = useQuestionMutationToasts()

  return useMutation({
    mutationFn: (value: QuestionInput) => createQuestion(value),
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      invalidateQuestions()
      notifyMutationSuccess(
        toastMessages.question.createSuccess,
        getToastMetaFromContext(context),
      )
    },
    onError: (error, _variables, _onMutateResult, context) => {
      notifyMutationError(
        toastMessages.question.createError,
        error,
        getToastMetaFromContext(context),
      )
    },
  })
}

export function useUpdateQuestion() {
  const invalidateQuestions = useInvalidateQuestions()

  const { toastMessages, notifyMutationError, notifyMutationSuccess } = useQuestionMutationToasts()

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: QuestionInput }) =>
      updateQuestion(id, value),
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      invalidateQuestions()
      notifyMutationSuccess(
        toastMessages.question.saveSuccess,
        getToastMetaFromContext(context),
      )
    },
    onError: (error, _variables, _onMutateResult, context) => {
      notifyMutationError(
        toastMessages.question.saveError,
        error,
        getToastMetaFromContext(context),
      )
    },
  })
}

export function useDeleteQuestion() {
  const invalidateQuestions = useInvalidateQuestions()

  const { toastMessages, notifyMutationError, notifyMutationSuccess } = useQuestionMutationToasts()

  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: (_data, _id, _onMutateResult, context) => {
      invalidateQuestions()
      notifyMutationSuccess(
        toastMessages.question.deleteSuccess,
        getToastMetaFromContext(context),
      )
    },
    onError: (error, _id, _onMutateResult, context) => {
      notifyMutationError(
        getDeleteQuestionErrorTitle(
          error,
          toastMessages.question.deleteError,
          toastMessages.deleteQuestion.cannotDeleteTitle,
        ),
        error,
        getToastMetaFromContext(context),
      )
    },
  })
}

export function useRestoreQuestion() {
  const invalidateQuestions = useInvalidateQuestions()

  const { toastMessages, notifyMutationError, notifyMutationSuccess } = useQuestionMutationToasts()

  return useMutation({
    mutationFn: (id: string) => restoreQuestion(id),
    onSuccess: (_data, _id, _onMutateResult, context) => {
      invalidateQuestions()
      notifyMutationSuccess(
        toastMessages.question.restoreSuccess,
        getToastMetaFromContext(context),
      )
    },
    onError: (error, _id, _onMutateResult, context) => {
      notifyMutationError(
        toastMessages.question.restoreError,
        error,
        getToastMetaFromContext(context),
      )
    },
  })
}

export function useBulkDeleteQuestions() {
  const invalidateQuestions = useInvalidateQuestions()

  return useMutation({
    mutationFn: (ids: string[]) => deleteQuestionsBulk(ids),
    onSuccess: () => {
      invalidateQuestions()
    },
  })
}
