'use client'

import { useCallback, useEffect, useState } from 'react'

import { generateCandidateLink } from '@/lib/api'
import { runMutation } from '@/lib/run-mutation'
import type { useToastMessages } from '@/lib/use-toast-messages'

type CandidateLinkStatus = 'idle' | 'loading' | 'ready' | 'error'
type CopyStatus = 'idle' | 'copied' | 'error'

interface UseCandidateLinkParams {
  id: string
  isDemo: boolean
  user: unknown
  toastMessages: ReturnType<typeof useToastMessages>
}

export function useCandidateLink({
  id,
  isDemo,
  user,
  toastMessages,
}: UseCandidateLinkParams) {
  const [candidateLink, setCandidateLink] = useState('')
  const [candidateLinkStatus, setCandidateLinkStatus] =
    useState<CandidateLinkStatus>('idle')
  const [candidateLinkError, setCandidateLinkError] = useState('')
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')

  const buildCandidateUrl = useCallback((relativeLink: string) => {
    if (typeof window === 'undefined') {
      return relativeLink
    }

    return new URL(relativeLink, window.location.origin).toString()
  }, [])

  const loadCandidateLink = useCallback(
    async (mode: 'initial' | 'refresh' = 'refresh') => {
      try {
        setCandidateLinkStatus('loading')
        setCandidateLinkError('')
        const data = await runMutation(() => generateCandidateLink(id), {
          showSuccessToast: mode === 'refresh',
          showErrorToast: mode === 'refresh',
          successMessage: toastMessages.interview.refreshLinkSuccess,
          errorMessage: toastMessages.interview.refreshLinkError,
        })
        setCandidateLink(buildCandidateUrl(data.candidateLink))
        setCandidateLinkStatus('ready')
        if (mode === 'refresh') {
          setCopyStatus('idle')
        }
      } catch (err) {
        setCandidateLink('')
        setCandidateLinkStatus('error')
        setCandidateLinkError(
          err instanceof Error
            ? err.message
            : toastMessages.interview.refreshLinkError,
        )
      }
    },
    [
      buildCandidateUrl,
      id,
      toastMessages.interview.refreshLinkError,
      toastMessages.interview.refreshLinkSuccess,
    ],
  )

  useEffect(() => {
    // Wait for auth to resolve so we don't fire a guaranteed-403 during hydration.
    if (!user) {
      return
    }
    // Demo users lack interviews:assign, so the call would always 403.
    if (isDemo) {
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial candidate-link load once auth/user resolves; mirrors original component behavior
    void loadCandidateLink('initial')
  }, [loadCandidateLink, isDemo, user])

  const handleCopyCandidateLink = useCallback(async () => {
    if (!candidateLink) {
      return
    }

    try {
      await navigator.clipboard.writeText(candidateLink)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }, [candidateLink])

  return {
    candidateLink,
    candidateLinkStatus,
    candidateLinkError,
    copyStatus,
    loadCandidateLink,
    handleCopyCandidateLink,
  }
}
