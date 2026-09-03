'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { getInterviewAnswerMedia, type Interview } from '@/lib/api'
import { getNextMediaQuestionIndex, hasAnswerMedia } from '@/lib/interview-detail-format'

import type { AnswerMediaState } from './interview-detail-types'

interface UseAnswerMediaParams {
  id: string
  interview: Interview | null
  failedLoadMediaLabel: string
}

interface LoadMediaOptions {
  prefetchNext?: boolean
}

export function useAnswerMedia({ id, interview, failedLoadMediaLabel }: UseAnswerMediaParams) {
  const [mediaByQuestion, setMediaByQuestion] = useState<Record<number, AnswerMediaState>>({})
  const requestedMediaRef = useRef<Map<number, string>>(new Map())
  const mediaFetchInterviewIdRef = useRef(id)
  const interviewRef = useRef(interview)

  useEffect(() => {
    interviewRef.current = interview
  }, [interview])

  useEffect(() => {
    if (mediaFetchInterviewIdRef.current !== id) {
      requestedMediaRef.current.clear()
      mediaFetchInterviewIdRef.current = id
      setMediaByQuestion({})
    }
  }, [id])

  const loadMediaForQuestion = useCallback(
    (questionIndex: number) => {
      const currentInterview = interviewRef.current
      if (!currentInterview) {
        return
      }

      const answer = currentInterview.answers.find((item) => item.questionIndex === questionIndex)
      if (!answer || !hasAnswerMedia(answer)) {
        return
      }

      const mediaFingerprint = `${answer.mediaKey ?? answer.camera?.mediaKey ?? ''}|${answer.screenMediaKey ?? answer.screen?.mediaKey ?? ''}`
      if (requestedMediaRef.current.get(questionIndex) === mediaFingerprint) {
        return
      }

      requestedMediaRef.current.set(questionIndex, mediaFingerprint)

      setMediaByQuestion((current) => ({
        ...current,
        [questionIndex]: {
          ...current[questionIndex],
          loading: true,
          errorMessage: undefined,
        },
      }))

      void getInterviewAnswerMedia(id, questionIndex)
        // eslint-disable-next-line promise/always-return
        .then((media) => {
          setMediaByQuestion((current) => ({
            ...current,
            [questionIndex]: {
              loading: false,
              cameraUrl: media.cameraUrl,
              screenUrl: media.screenUrl,
            },
          }))
        })
        .catch((mediaError) => {
          requestedMediaRef.current.delete(questionIndex)
          setMediaByQuestion((current) => ({
            ...current,
            [questionIndex]: {
              loading: false,
              errorMessage: mediaError instanceof Error ? mediaError.message : failedLoadMediaLabel,
            },
          }))
        })
    },
    [id, failedLoadMediaLabel],
  )

  const loadMedia = useCallback(
    (questionIndex: number, options: LoadMediaOptions = {}) => {
      const { prefetchNext = true } = options
      loadMediaForQuestion(questionIndex)

      if (!prefetchNext) {
        return
      }

      const currentInterview = interviewRef.current
      if (!currentInterview) {
        return
      }

      const nextQuestionIndex = getNextMediaQuestionIndex(currentInterview, questionIndex)
      if (nextQuestionIndex !== undefined) {
        loadMediaForQuestion(nextQuestionIndex)
      }
    },
    [loadMediaForQuestion],
  )

  return {
    mediaByQuestion,
    loadMedia,
  }
}
