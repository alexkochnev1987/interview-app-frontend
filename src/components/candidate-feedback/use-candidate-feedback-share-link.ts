'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  createCandidateFeedbackShareLink,
  getCandidateFeedbackShareLinkStatus,
  revokeCandidateFeedbackShareLink,
} from '@/lib/api'
import type { Locale } from '@/i18n/locales'
import {
  candidateFeedbackShareExpiresAtMatches,
  clearStoredCandidateFeedbackShareLink,
  readStoredCandidateFeedbackShareLink,
  writeStoredCandidateFeedbackShareLink,
} from '@/lib/candidate-feedback-share-link-storage'
import { buildCandidateFeedbackShareUrl } from '@/lib/interview-detail-format'
import { runMutation } from '@/lib/run-mutation'
import { notifyError } from '@/lib/toast'
import type { useCandidateFeedbackToastMessages } from '@/lib/toast-messages/use-candidate-feedback-toast-messages'

type ShareLinkStatus = 'idle' | 'loading' | 'ready' | 'error'
type CopyStatus = 'idle' | 'copied' | 'error'

type ToastMessages = ReturnType<typeof useCandidateFeedbackToastMessages>

interface UseCandidateFeedbackShareLinkParams {
  interviewId: string
  interviewLocale: Locale
  hasPublishable: boolean
  canCreateShareLink: boolean
  canRevokeShareLink: boolean
  toastMessages: ToastMessages
}

export function useCandidateFeedbackShareLink({
  interviewId,
  interviewLocale,
  hasPublishable,
  canCreateShareLink,
  canRevokeShareLink,
  toastMessages,
}: UseCandidateFeedbackShareLinkParams) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [hasActiveLink, setHasActiveLink] = useState(false)
  const [statusLoadState, setStatusLoadState] =
    useState<ShareLinkStatus>('idle')
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const statusRequestIdRef = useRef(0)

  const clearLocalShareLink = useCallback(() => {
    setHasActiveLink(false)
    setShareUrl(null)
    setExpiresAt(null)
    clearStoredCandidateFeedbackShareLink(interviewId)
  }, [interviewId])

  const normalizeShareUrl = useCallback(
    (apiUrl: string) => {
      if (typeof window === 'undefined') {
        return apiUrl
      }
      return buildCandidateFeedbackShareUrl(
        apiUrl,
        interviewLocale,
        window.location.origin,
      )
    },
    [interviewLocale],
  )

  const loadStatus = useCallback(async () => {
    if (!canCreateShareLink) {
      clearLocalShareLink()
      setStatusLoadState('ready')
      return
    }

    const requestId = ++statusRequestIdRef.current
    setStatusLoadState('loading')
    try {
      const result = await getCandidateFeedbackShareLinkStatus(interviewId)
      if (requestId !== statusRequestIdRef.current) {
        return
      }

      if (result && hasPublishable) {
        setHasActiveLink(true)
        setExpiresAt(result.expiresAt)
        setShareUrl((current) => {
          if (current) {
            return current
          }
          const stored = readStoredCandidateFeedbackShareLink(interviewId)
          if (
            stored &&
            candidateFeedbackShareExpiresAtMatches(
              stored.expiresAt,
              result.expiresAt,
            )
          ) {
            return stored.url
          }
          return null
        })
      } else {
        clearLocalShareLink()
      }
      setStatusLoadState('ready')
    } catch {
      if (requestId !== statusRequestIdRef.current) {
        return
      }
      setStatusLoadState('error')
    }
  }, [canCreateShareLink, clearLocalShareLink, hasPublishable, interviewId])

  useEffect(() => {
    // Reload when publishability or create permission flips.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync share-link status with publishable feedback
    void loadStatus()
  }, [loadStatus])

  const createShareLink = useCallback(async () => {
    if (!canCreateShareLink) {
      return
    }
    if (!hasPublishable) {
      notifyError(toastMessages.createShareLinkNotPublishable)
      return
    }

    setCreating(true)
    setCopyStatus('idle')
    try {
      const data = await runMutation(
        () => createCandidateFeedbackShareLink(interviewId),
        {
          successMessage: toastMessages.createShareLinkSuccess,
          errorMessage: toastMessages.createShareLinkError,
        },
      )
      // Invalidate in-flight status fetches so a stale 404 cannot wipe the new URL.
      statusRequestIdRef.current += 1
      const normalizedUrl = normalizeShareUrl(data.url)
      setShareUrl(normalizedUrl)
      setExpiresAt(data.expiresAt)
      setHasActiveLink(true)
      setStatusLoadState('ready')
      writeStoredCandidateFeedbackShareLink(interviewId, {
        url: normalizedUrl,
        expiresAt: data.expiresAt,
      })
    } catch {
      // toast handled by runMutation
    } finally {
      setCreating(false)
    }
  }, [
    canCreateShareLink,
    hasPublishable,
    interviewId,
    normalizeShareUrl,
    toastMessages.createShareLinkError,
    toastMessages.createShareLinkNotPublishable,
    toastMessages.createShareLinkSuccess,
  ])

  const revokeShareLink = useCallback(async () => {
    if (!canRevokeShareLink) {
      return
    }

    setRevoking(true)
    setCopyStatus('idle')
    try {
      await runMutation(() => revokeCandidateFeedbackShareLink(interviewId), {
        successMessage: toastMessages.revokeShareLinkSuccess,
        errorMessage: toastMessages.revokeShareLinkError,
      })
      statusRequestIdRef.current += 1
      clearLocalShareLink()
      setStatusLoadState('ready')
    } catch {
      // toast handled by runMutation
    } finally {
      setRevoking(false)
    }
  }, [
    canRevokeShareLink,
    clearLocalShareLink,
    interviewId,
    toastMessages.revokeShareLinkError,
    toastMessages.revokeShareLinkSuccess,
  ])

  const copyShareLink = useCallback(async () => {
    if (!shareUrl) {
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }, [shareUrl])

  return {
    shareUrl,
    expiresAt,
    hasActiveLink,
    statusLoadState,
    creating,
    revoking,
    copyStatus,
    createShareLink,
    revokeShareLink,
    copyShareLink,
  }
}
