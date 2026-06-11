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
  draftQuestion,
  restoreQuestion,
  updateQuestion,
  type QuestionInput,
} from '@/lib/api'
import { getDeleteQuestionErrorTitle, getErrorMessage } from '@/lib/api-error'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useToastMessages } from '@/lib/use-toast-messages'
import {notifyBulkDeleteOutcome} from "@/lib/notify-bulk-delete";

type QuestionMutationErrorTitle = string | ((error: unknown) => string)

function useInvalidateQuestions() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: questionsRootQueryKey() })
  }, [queryClient])
}

function useQuestionMutationResources() {
  const invalidateQuestions=useInvalidateQuestions()
  const toastMessages=useToastMessages()

  const notifyMutationError= (
      title: string,
      error:unknown,
      options?:{id?:string}
  )=>{
    notifyError(title, {
      id: options?.id,
      description: getErrorMessage(error, toastMessages.defaults.error),
    })
  }

  const notifyMutationSuccess= (message:string)=>{
    notifySuccess(message)
  }

  return {
    toastMessages,
    invalidateQuestions,
    notifyMutationError,
    notifyMutationSuccess,
  }
}

type BuildQuestionMutationOptionsConfig<TData, TVariables> = {
  mutationFn:(variables:TVariables)=> Promise<TData>
  successMessage: string
  errorTitle: QuestionMutationErrorTitle
}

export function buildQuestionMutationOptions<TData, TVariables>(
    resources: ReturnType<typeof useQuestionMutationResources>,
    config: BuildQuestionMutationOptionsConfig<TData, TVariables>,
){
  const {
    invalidateQuestions,
    notifyMutationError,
    notifyMutationSuccess,
  } = resources

  return {
    mutationFn: config.mutationFn,
    onSuccess: ()=>{
      invalidateQuestions()
      notifyMutationSuccess(config.successMessage)
    },
    onError: (error: unknown) => {
      const title =
        typeof config.errorTitle === 'function'
          ? config.errorTitle(error)
          : config.errorTitle

      notifyMutationError(title, error)
    },
  }
}

export function useCreateQuestion() {

  const resources=useQuestionMutationResources()

  return useMutation(
      buildQuestionMutationOptions(resources, {
        mutationFn:createQuestion,
        successMessage:resources.toastMessages.question.createSuccess,
        errorTitle:resources.toastMessages.question.createError
      })
  )
}

export function useUpdateQuestion() {
  const resources = useQuestionMutationResources()

  return useMutation(
      buildQuestionMutationOptions(resources,{
        mutationFn: ({ id, value }: { id: string; value: QuestionInput }) =>
          updateQuestion(id, value),
        successMessage:resources.toastMessages.question.saveSuccess,
        errorTitle:resources.toastMessages.question.saveError
      })
  )
}

export function useDeleteQuestion() {

  const resources = useQuestionMutationResources()

  return useMutation(
      buildQuestionMutationOptions(resources,{
        mutationFn: deleteQuestion,
        successMessage:resources.toastMessages.question.deleteSuccess,
        errorTitle:(error)=> getDeleteQuestionErrorTitle(
            error,
            resources.toastMessages.question.deleteError,
            resources.toastMessages.deleteQuestion.cannotDeleteTitle,
        )
      })
  )
}

export function useRestoreQuestion() {

  const resources = useQuestionMutationResources()

  return useMutation(
      buildQuestionMutationOptions(resources,{
        mutationFn:restoreQuestion,
        successMessage: resources.toastMessages.question.restoreSuccess,
        errorTitle: resources.toastMessages.question.restoreError,
      })
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
        id: 'bulk-delete-error',
      })
    },
  }
}

export function useBulkDeleteQuestions() {
  const resources = useQuestionMutationResources()

  return useMutation(buildBulkDeleteMutationOptions(resources))
}

/** Draft errors stay inline in QuestionEditor; this hook doesn't toast. */
export function useDraftQuestion() {
  return useMutation({
    mutationFn: (value: QuestionInput) => draftQuestion(value),
  })
}
