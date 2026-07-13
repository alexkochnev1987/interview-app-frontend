'use client'

import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { templatesRootQueryKey } from '@/components/templates/query-keys'
import {
  createTemplate,
  deleteTemplate,
  updateTemplate,
  type CreateTemplatePayload,
  type UpdateTemplatePayload,
} from '@/lib/api'
import { getErrorMessage } from '@/lib/api-error'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useToastMessages } from '@/lib/use-toast-messages'

function useInvalidateTemplates() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: templatesRootQueryKey() })
  }, [queryClient])
}

export function useCreateTemplate() {
  const invalidateTemplates = useInvalidateTemplates()
  const { template, defaults } = useToastMessages()

  return useMutation({
    mutationFn: (value: CreateTemplatePayload) => createTemplate(value),
    onSuccess: () => {
      invalidateTemplates()
      notifySuccess(template.createSuccess)
    },
    onError: (error: unknown) => {
      notifyError(template.createError, {
        description: getErrorMessage(error, defaults.error),
      })
    },
  })
}

export function useUpdateTemplate() {
  const invalidateTemplates = useInvalidateTemplates()
  const { template, defaults } = useToastMessages()

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: UpdateTemplatePayload }) =>
      updateTemplate(id, value),
    onSuccess: () => {
      invalidateTemplates()
      notifySuccess(template.updateSuccess)
    },
    onError: (error: unknown) => {
      notifyError(template.updateError, {
        description: getErrorMessage(error, defaults.error),
      })
    },
  })
}

export function useDeleteTemplate() {
  const invalidateTemplates = useInvalidateTemplates()
  const { template, defaults } = useToastMessages()

  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      invalidateTemplates()
      notifySuccess(template.deleteSuccess)
    },
    onError: (error: unknown) => {
      notifyError(template.deleteError, {
        description: getErrorMessage(error, defaults.error),
      })
    },
  })
}
