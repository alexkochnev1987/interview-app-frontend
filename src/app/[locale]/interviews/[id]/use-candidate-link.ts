'use client'

import { useCallback, useEffect, useState } from 'react'

import { generateCandidateLink } from '@/lib/api'
import { localizedPath } from '@/i18n/pathname'
import type { Locale } from '@/i18n/locales'
import { runMutation } from '@/lib/run-mutation'
import type { useToastMessages } from '@/lib/use-toast-messages'

type CandidateLinkStatus = 'idle' | 'loading' | 'ready' | 'error'
type CopyStatus = 'idle' | 'copied' | 'error'

interface UseCandidateLinkParams {
  id: string
  interviewLocale?: Locale
  isDemo: boolean
  user: unknown
  toastMessages: ReturnType<typeof useToastMessages>
}

export function useCandidateLink({
  id,
  interviewLocale,
  isDemo,
  user,
  toastMessages,
}: UseCandidateLinkParams) {
  const [candidateLink, setCandidateLink] = useState('')
  const [candidateLinkStatus, setCandidateLinkStatus] =
    useState<CandidateLinkStatus>('idle')
  const [candidateLinkError, setCandidateLinkError] = useState('')
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')

  const buildCandidateUrl = useCallback(
    (relativeLink: string) => {
      if (typeof window === 'undefined') {
        return relativeLink
      }

      try {
        const url = new URL(relativeLink, window.location.origin)
        const token = url.searchParams.get('token')
        if (!token || !interviewLocale) {
          return url.toString()
        }

        return `${window.location.origin}${localizedPath(
          `/take/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`,
          interviewLocale,
        )}`
      } catch {
        return relativeLink
      }
    },
    [id, interviewLocale],
  )

  const loadCandidateLink = useCallback(
    async (mode: 'initial' | 'refresh' = 'refresh') => {
      if (isDemo) {
        return
      }
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
      isDemo,
      toastMessages.interview.refreshLinkError,
      toastMessages.interview.refreshLinkSuccess,
    ],
  )

  useEffect(() => {
    if (!user) {
      return
    }
    if (isDemo) {
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial candidate-link load once auth/user resolves
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
