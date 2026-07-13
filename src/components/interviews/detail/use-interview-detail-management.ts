'use client'

import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { interviewsRootQueryKey } from '@/components/interviews/library/query-keys'
import { useRouter } from '@/i18n/navigation'
import { cancelInterview, deleteInterview, type Interview } from '@/lib/api'
import { runPostInterviewRemovalSuccess } from '@/lib/interview-removal-flow'
import { runMutation } from '@/lib/run-mutation'
import { useToastMessages } from '@/lib/use-toast-messages'

type UseInterviewDetailManagementOptions = {
  interviewId: string
  onInterviewUpdated: (updated: Interview) => void
}

export function useInterviewDetailManagement({
  interviewId,
  onInterviewUpdated,
}: UseInterviewDetailManagementOptions) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toastMessages = useToastMessages()

  const invalidateInterviews = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: interviewsRootQueryKey() })
  }, [queryClient])
  const [isEditing, setIsEditing] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const startEditing = useCallback(() => {
    setIsEditing(true)
  }, [])

  const exitEditing = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleEditSaved = useCallback(
    (updated: Interview) => {
      onInterviewUpdated(updated)
      setIsEditing(false)
      router.refresh()
    },
    [onInterviewUpdated, router],
  )

  const handleCancelInterview = useCallback(async () => {
    if (canceling) return

    setCanceling(true)

    try {
      await runMutation(() => cancelInterview(interviewId), {
        successMessage: toastMessages.interview.cancelSuccess,
        errorMessage: toastMessages.interview.cancelError,
      })
      runPostInterviewRemovalSuccess({
        closeConfirm: () => setCancelConfirmOpen(false),
        push: router.push,
        invalidateInterviews,
      })
    } catch {
      /* toast handled by runMutation */
    } finally {
      setCanceling(false)
    }
  }, [
    canceling,
    interviewId,
    router,
    invalidateInterviews,
    toastMessages.interview.cancelError,
    toastMessages.interview.cancelSuccess,
  ])

  const handleDeleteInterview = useCallback(async () => {
    if (deleting) return

    setDeleting(true)

    try {
      await runMutation(() => deleteInterview(interviewId), {
        successMessage: toastMessages.interview.deleteSuccess,
        errorMessage: toastMessages.interview.deleteError,
      })
      runPostInterviewRemovalSuccess({
        closeConfirm: () => setDeleteConfirmOpen(false),
        push: router.push,
        invalidateInterviews,
      })
    } catch {
      /* toast handled by runMutation */
    } finally {
      setDeleting(false)
    }
  }, [
    deleting,
    interviewId,
    invalidateInterviews,
    router,
    toastMessages.interview.deleteError,
    toastMessages.interview.deleteSuccess,
  ])


  return {
    isEditing,
    startEditing,
    exitEditing,
    handleEditSaved,
    cancelConfirmOpen,
    setCancelConfirmOpen,
    canceling,
    handleCancelInterview,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleting,
    handleDeleteInterview,
  }
}
