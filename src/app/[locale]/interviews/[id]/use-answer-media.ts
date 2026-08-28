'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { getInterviewAnswerMedia, type Interview } from '@/lib/api'

import type { AnswerMediaState } from './interview-detail-types'

interface UseAnswerMediaParams {
  id: string
  interview: Interview | null
  failedLoadMediaLabel: string
}

export function useAnswerMedia({ id, interview, failedLoadMediaLabel }: UseAnswerMediaParams) {
  const [mediaByQuestion, setMediaByQuestion] = useState<Record<number, AnswerMediaState>>({})
  const requestedMediaRef = useRef<Map<number, string>>(new Map())
  const mediaFetchInterviewIdRef = useRef(id)

  useEffect(() => {
    if (mediaFetchInterviewIdRef.current !== id) {
      requestedMediaRef.current.clear()
      mediaFetchInterviewIdRef.current = id
      setMediaByQuestion({})
    }
  }, [id])

  const loadMedia = useCallback(
    (questionIndex: number) => {
      if (!interview) {
        return
      }

      const answer = interview.answers.find((a) => a.questionIndex === questionIndex)
      if (!answer || (!answer.mediaKey && !answer.screenMediaKey)) {
        return
      }

      const mediaFingerprint = `${answer.mediaKey ?? ''}|${answer.screenMediaKey ?? ''}`
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
    [id, interview, failedLoadMediaLabel],
  )

  return {
    mediaByQuestion,
    loadMedia,
  }
}
