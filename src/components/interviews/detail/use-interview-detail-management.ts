'use client'

import { useCallback, useState } from 'react'

import { useRouter } from '@/i18n/navigation'
import { cancelInterview, type Interview } from '@/lib/api'
import { runPostCancelInterviewSuccess } from '@/lib/interview-cancel-flow'
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
  const toastMessages = useToastMessages()
  const [isEditing, setIsEditing] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)

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
      runPostCancelInterviewSuccess({
        closeConfirm: () => setCancelConfirmOpen(false),
        push: router.push,
        refresh: router.refresh,
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
    toastMessages.interview.cancelError,
    toastMessages.interview.cancelSuccess,
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
  }
}
