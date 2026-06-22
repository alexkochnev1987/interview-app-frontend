'use client'

import { useCallback, useState } from 'react'

import {
  completeUploadAndFetchInterview,
  getPresignedUrl,
  type Interview,
} from '@/lib/api'
import { runMutation } from '@/lib/run-mutation'
import type { useToastMessages } from '@/lib/use-toast-messages'

import type { QuestionUploadState } from './interview-detail-types'

interface UseAnswerUploadsParams {
  initialInterview: Interview
  interview: Interview | null
  setInterview: (interview: Interview) => void
  toastMessages: ReturnType<typeof useToastMessages>
  uploadToStorageFailedLabel: string
  uploadFailedLabel: string
}

export function useAnswerUploads({
  initialInterview,
  interview,
  setInterview,
  toastMessages,
  uploadToStorageFailedLabel,
  uploadFailedLabel,
}: UseAnswerUploadsParams) {
  const [uploadStates, setUploadStates] = useState<QuestionUploadState[]>(
    initialInterview.questions.map((_, qi) => {
      const hasAnswer = initialInterview.answers.some(
        (answer) => answer.questionIndex === qi,
      )
      return {
        status: hasAnswer ? 'uploaded' : 'idle',
      } as QuestionUploadState
    }),
  )

  const handleUpload = useCallback(
    async (questionIndex: number, fileInput: HTMLInputElement | null) => {
      if (!fileInput?.files?.length || !interview) {
        return
      }

      const file = fileInput.files[0]

      setUploadStates((current) =>
        current.map((state, index) =>
          index === questionIndex ? { status: 'uploading' } : state,
        ),
      )

      try {
        const refreshedInterview = await runMutation(
          async () => {
            const { uploadUrl, mediaKey } = await getPresignedUrl(
              interview.id,
              questionIndex,
              file.type as 'video/webm',
            )

            const uploadResponse = await fetch(uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': file.type },
              body: file,
            })

            if (!uploadResponse.ok) {
              throw new Error(uploadToStorageFailedLabel)
            }

            return completeUploadAndFetchInterview(
              interview.id,
              questionIndex,
              mediaKey,
            )
          },
          {
            successMessage: toastMessages.interview.uploadSuccess(
              questionIndex + 1,
            ),
            errorMessage: toastMessages.interview.uploadError(questionIndex + 1),
          },
        )
        setInterview(refreshedInterview)
        setUploadStates((current) =>
          current.map((state, index) =>
            index === questionIndex ? { status: 'uploaded' } : state,
          ),
        )
      } catch (err) {
        setUploadStates((current) =>
          current.map((state, index) =>
            index === questionIndex
              ? {
                  status: 'error',
                  errorMessage:
                    err instanceof Error ? err.message : uploadFailedLabel,
                }
              : state,
          ),
        )
      }
    },
    [
      interview,
      setInterview,
      toastMessages.interview,
      uploadToStorageFailedLabel,
      uploadFailedLabel,
    ],
  )

  return {
    uploadStates,
    handleUpload,
  }
}
