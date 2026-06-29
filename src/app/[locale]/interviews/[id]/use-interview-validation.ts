'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  getInterview,
  getResults,
  validateInterview,
  type Interview,
  type InterviewResult,
} from '@/lib/api'
import { runMutation } from '@/lib/run-mutation'
import type { useToastMessages } from '@/lib/use-toast-messages'

interface UseInterviewValidationParams {
  id: string
  interview: Interview | null
  setInterview: (interview: Interview) => void
  setResults: (results: InterviewResult | null) => void
  toastMessages: ReturnType<typeof useToastMessages>
  resultsWarningLabel: string
}

export function useInterviewValidation({
  id,
  interview,
  setInterview,
  setResults,
  toastMessages,
  resultsWarningLabel,
}: UseInterviewValidationParams) {
  const [validating, setValidating] = useState(false)
  const validationPollRef = useRef<number | null>(null)

  const stopValidationPolling = useCallback(() => {
    if (validationPollRef.current !== null) {
      window.clearInterval(validationPollRef.current)
      validationPollRef.current = null
    }
    setValidating(false)
  }, [])

  const startValidationPolling = useCallback(() => {
    if (validationPollRef.current !== null) {
      return
    }

    validationPollRef.current = window.setInterval(async () => {
      try {
        const refreshedInterview = await getInterview(id)
        setInterview(refreshedInterview)
        setResults(refreshedInterview.result ?? null)

        const hasActiveValidation = refreshedInterview.answers.some(
          (answer) =>
            answer.validation?.status === 'queued' ||
            answer.validation?.status === 'processing',
        )

        if (refreshedInterview.status === 'completed') {
          stopValidationPolling()
          try {
            const nextResults = await getResults(id)
            setResults(nextResults)
          } catch (resultsError) {
            console.warn(resultsWarningLabel, resultsError)
          }
          return
        }

        if (!hasActiveValidation) {
          stopValidationPolling()
        }
      } catch (pollError) {
        console.warn('Validation polling stopped', pollError)
        stopValidationPolling()
      }
    }, 2500)
  }, [id, setInterview, setResults, stopValidationPolling, resultsWarningLabel])

  useEffect(() => {
    return () => {
      if (validationPollRef.current !== null) {
        window.clearInterval(validationPollRef.current)
      }
    }
  }, [])

  const handleValidate = useCallback(async () => {
    if (!interview) {
      return
    }

    setValidating(true)

    try {
      await runMutation(() => validateInterview(interview.id, { force: true }), {
        successMessage: toastMessages.interview.validationStartSuccess,
        errorMessage: toastMessages.interview.validationStartError,
      })
      const refreshedInterview = await getInterview(interview.id)
      setInterview(refreshedInterview)
      setResults(refreshedInterview.result ?? null)
      startValidationPolling()
    } catch {
      setValidating(false)
    }
  }, [
    interview,
    setInterview,
    setResults,
    startValidationPolling,
    toastMessages.interview.validationStartError,
    toastMessages.interview.validationStartSuccess,
  ])

  return {
    validating,
    handleValidate,
  }
}
