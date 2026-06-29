'use client'

import { useEffect, useRef, useState } from 'react'

import { getInterviewAnswerMedia, type Interview } from '@/lib/api'

import type { AnswerMediaState } from './interview-detail-types'

interface UseAnswerMediaParams {
  id: string
  interview: Interview | null
  failedLoadMediaLabel: string
}

export function useAnswerMedia({
  id,
  interview,
  failedLoadMediaLabel,
}: UseAnswerMediaParams) {
  const [mediaByQuestion, setMediaByQuestion] = useState<
    Record<number, AnswerMediaState>
  >({})
  const requestedMediaRef = useRef<Map<number, string>>(new Map())
  const mediaFetchInterviewIdRef = useRef(id)

  useEffect(() => {
    if (!interview) {
      return
    }

    if (mediaFetchInterviewIdRef.current !== id) {
      requestedMediaRef.current.clear()
      mediaFetchInterviewIdRef.current = id
    }

    const answersWithMedia = interview.answers.filter(
      (answer) => answer.mediaKey || answer.screenMediaKey,
    )
    if (answersWithMedia.length === 0) {
      return
    }

    answersWithMedia.forEach((answer) => {
      const mediaFingerprint = `${answer.mediaKey ?? ''}|${answer.screenMediaKey ?? ''}`
      if (
        requestedMediaRef.current.get(answer.questionIndex) === mediaFingerprint
      ) {
        return
      }

      requestedMediaRef.current.set(answer.questionIndex, mediaFingerprint)

      setMediaByQuestion((current) => ({
        ...current,
        [answer.questionIndex]: {
          ...current[answer.questionIndex],
          loading: true,
          errorMessage: undefined,
        },
      }))

      void getInterviewAnswerMedia(id, answer.questionIndex)
        .then((media) => {
          setMediaByQuestion((current) => ({
            ...current,
            [answer.questionIndex]: {
              loading: false,
              cameraUrl: media.cameraUrl,
              screenUrl: media.screenUrl,
            },
          }))
        })
        .catch((mediaError) => {
          setMediaByQuestion((current) => ({
            ...current,
            [answer.questionIndex]: {
              loading: false,
              errorMessage:
                mediaError instanceof Error
                  ? mediaError.message
                  : failedLoadMediaLabel,
            },
          }))
        })
    })
  }, [id, interview, failedLoadMediaLabel])

  return {
    mediaByQuestion,
  }
}
