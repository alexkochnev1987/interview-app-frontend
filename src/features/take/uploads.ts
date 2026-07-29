import { ApiError } from '@/lib/api-error'

import type { CaptureTarget, MultipartUploadState } from './runtime'

interface CompleteMultipartUploadParams {
  target: CaptureTarget
  multipartUploadsRef: { current: MultipartUploadState }
  completeMultipartUploadRequest: (
    questionIndex: number,
    mediaKey: string,
    uploadId: string,
    options: {
      versionNumber: number
    },
  ) => Promise<void>
}

export async function completeMultipartUpload({
  target,
  multipartUploadsRef,
  completeMultipartUploadRequest,
}: CompleteMultipartUploadParams) {
  const session = multipartUploadsRef.current[target]
  if (!session) {
    throw new Error(`${target} upload session is not initialized.`)
  }
  if (session.completed || session.aborted) {
    return
  }

  if (session.uploadedPartCount === 0) {
    session.completed = true
    return
  }

  try {
    await completeMultipartUploadRequest(
      session.questionIndex,
      session.mediaKey,
      session.uploadId,
      {
        versionNumber: session.versionNumber,
      },
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new Error(`Failed to finalize ${target} upload.`)
  }

  session.completed = true
}

interface AbortMultipartUploadsParams {
  multipartUploadsRef: { current: MultipartUploadState }
  abortMultipartUploadRequest: (
    questionIndex: number,
    mediaKey: string,
    uploadId: string,
    options: {
      versionNumber: number
    },
  ) => Promise<void>
}

export async function abortMultipartUploads({
  multipartUploadsRef,
  abortMultipartUploadRequest,
}: AbortMultipartUploadsParams) {
  const uploadsSnapshot = multipartUploadsRef.current
  const entries = (
    [
      ['camera', uploadsSnapshot.camera],
      ['screen', uploadsSnapshot.screen],
    ] as const
  ).filter(([, session]) => Boolean(session))

  await Promise.all(
    entries.map(async ([target, session]) => {
      if (!session || session.aborted || session.completed) {
        return
      }

      session.aborted = true

      try {
        await session.uploadChain.catch(() => undefined)
        await abortMultipartUploadRequest(
          session.questionIndex,
          session.mediaKey,
          session.uploadId,
          {
            versionNumber: session.versionNumber,
          },
        )
      } catch {
        console.error(`Failed to abort ${target} multipart upload.`)
      }
    }),
  )
}
