'use client'

import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { questionsRootQueryKey } from '@/components/questions/picker/query-keys'
import {
  createQuestion,
  deleteQuestion,
  deleteQuestionsBulk,
  restoreQuestion,
  updateQuestion,
  type QuestionInput,
} from '@/lib/api'

function useInvalidateQuestions() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: questionsRootQueryKey() })
  }, [queryClient])
}

export function useCreateQuestion() {
  const invalidateQuestions = useInvalidateQuestions()

  return useMutation({
    mutationFn: (value: QuestionInput) => createQuestion(value),
    onSuccess: invalidateQuestions,
  })
}

export function useUpdateQuestion() {
  const invalidateQuestions = useInvalidateQuestions()

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: QuestionInput }) =>
      updateQuestion(id, value),
    onSuccess: invalidateQuestions,
  })
}

export function useDeleteQuestion() {
  const invalidateQuestions = useInvalidateQuestions()

  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: invalidateQuestions,
  })
}

export function useRestoreQuestion() {
  const invalidateQuestions = useInvalidateQuestions()

  return useMutation({
    mutationFn: (id: string) => restoreQuestion(id),
    onSuccess: invalidateQuestions,
  })
}

export function useBulkDeleteQuestions() {
  const invalidateQuestions = useInvalidateQuestions()

  return useMutation({
    mutationFn: (ids: string[]) => deleteQuestionsBulk(ids),
    onSuccess: invalidateQuestions,
  })
}
