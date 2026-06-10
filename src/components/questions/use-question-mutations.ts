'use client'

import { useCallback } from 'react'
import {
  useMutation,
  useQueryClient,
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
import {notifyBulkDeleteOutcome} from "@/lib/notify-bulk-delete";

function useQuestionMutationToasts() {
  const toastMessages = useToastMessages()

  const notifyMutationError = (title: string, error: unknown) => {
    notifyError(title, { description: getErrorMessage(error) })
  }

  const notifyMutationSuccess = (message: string) => {
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
    onSuccess: (_data, _variables, _onMutateResult ) => {
      invalidateQuestions()
      notifyMutationSuccess(
        toastMessages.question.createSuccess,
      )
    },
    onError: (error, _variables, _onMutateResult) => {
      notifyMutationError(
        toastMessages.question.createError,
        error,
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
    onSuccess: (_data, _variables, _onMutateResult) => {
      invalidateQuestions()
      notifyMutationSuccess(
        toastMessages.question.saveSuccess,
      )
    },
    onError: (error, _variables, _onMutateResult) => {
      notifyMutationError(
        toastMessages.question.saveError,
        error,
      )
    },
  })
}

export function useDeleteQuestion() {
  const invalidateQuestions = useInvalidateQuestions()

  const { toastMessages, notifyMutationError, notifyMutationSuccess } = useQuestionMutationToasts()

  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: (_data, _id, _onMutateResult) => {
      invalidateQuestions()
      notifyMutationSuccess(
        toastMessages.question.deleteSuccess,
      )
    },
    onError: (error, _id, _onMutateResult) => {
      notifyMutationError(
        getDeleteQuestionErrorTitle(
          error,
          toastMessages.question.deleteError,
          toastMessages.deleteQuestion.cannotDeleteTitle,
        ),
        error,
      )
    },
  })
}

export function useRestoreQuestion() {
  const invalidateQuestions = useInvalidateQuestions()

  const { toastMessages, notifyMutationError, notifyMutationSuccess } = useQuestionMutationToasts()

  return useMutation({
    mutationFn: (id: string) => restoreQuestion(id),
    onSuccess: (_data, _id, _onMutateResult) => {
      invalidateQuestions()
      notifyMutationSuccess(
        toastMessages.question.restoreSuccess,
      )
    },
    onError: (error, _id, _onMutateResult) => {
      notifyMutationError(
        toastMessages.question.restoreError,
        error,
      )
    },
  })
}

export function useBulkDeleteQuestions() {
  const invalidateQuestions = useInvalidateQuestions()
  const {toastMessages, notifyMutationError}= useQuestionMutationToasts()

  return useMutation({
    mutationFn: (ids: string[]) => deleteQuestionsBulk(ids),
    onSuccess: (result) => {
      invalidateQuestions()
      notifyBulkDeleteOutcome(result, toastMessages.bulkDelete)
    },
    onError: (error)=>{
      notifyMutationError(toastMessages.bulkDelete.failedTitle, error)
    }
  })
}
