// oxlint-disable no-await-in-loop
import type { MultipartUploadPartResponse } from '@/lib/api'

import type { CaptureTarget, MultipartUploadSession, MultipartUploadState } from './runtime'

const MULTIPART_PART_SIZE_BYTES = 6 * 1024 * 1024

interface QueueBufferedUploadParams {
  target: CaptureTarget
  multipartUploadsRef: { current: MultipartUploadState }
  forceFinal?: boolean
  preSignMultipartPartUpload: (
    target: CaptureTarget,
    session: MultipartUploadSession,
    partNumber: number,
  ) => Promise<MultipartUploadPartResponse>
  uploadMultipartPart: (uploadUrl: string, partBlob: Blob) => Promise<void>
}

export function queueBufferedUpload({
  target,
  multipartUploadsRef,
  forceFinal = false,
  preSignMultipartPartUpload,
  uploadMultipartPart,
}: QueueBufferedUploadParams) {
  const session = multipartUploadsRef.current[target]
  if (!session) {
    return Promise.resolve()
  }

  if (session.uploadError) {
    return Promise.reject(new Error(session.uploadError))
  }

  // oxlint-disable-next-line promise/always-return
  session.uploadChain = session.uploadChain.then(async () => {
    let activeSession = multipartUploadsRef.current[target]

    while (activeSession && !activeSession.aborted && !activeSession.completed) {
      if (activeSession.uploadError) {
        throw new Error(activeSession.uploadError)
      }

      const hasEnoughBytes = activeSession.bufferedBytes >= MULTIPART_PART_SIZE_BYTES
      const hasFinalBytes = forceFinal && activeSession.bufferedBytes > 0
      if (!hasEnoughBytes && !hasFinalBytes) {
        break
      }
      const inferredType =
        activeSession.partBlobType?.trim() ||
        activeSession.bufferedChunks[0]?.type?.trim() ||
        'video/webm'
      const partBlob = new Blob(activeSession.bufferedChunks, { type: inferredType })
      activeSession.bufferedChunks = []
      activeSession.bufferedBytes = 0

      const partNumber = activeSession.nextPartNumber
      activeSession.nextPartNumber += 1

      let partUpload: MultipartUploadPartResponse
      try {
        partUpload = await preSignMultipartPartUpload(target, activeSession, partNumber)
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : `Chunk upload pre-sign failed for ${target} recording.`
        if (activeSession) {
          activeSession.uploadError = message
        }
        throw new Error(message, { cause: err })
      }

      try {
        await uploadMultipartPart(partUpload.uploadUrl, partBlob)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : `Chunk upload failed for ${target} recording.`
        if (activeSession) {
          activeSession.uploadError = message
        }
        throw new Error(message, { cause: err })
      }

      activeSession = multipartUploadsRef.current[target]
      if (activeSession) {
        activeSession.uploadedPartCount += 1
      }
    }
  })

  return session.uploadChain
}

interface HandleRecordedChunkParams {
  target: CaptureTarget
  blob: Blob
  multipartUploadsRef: { current: MultipartUploadState }
  queueBufferedUpload: (target: CaptureTarget, forceFinal?: boolean) => Promise<void>
}

export function handleRecordedChunk({
  target,
  blob,
  multipartUploadsRef,
  queueBufferedUpload: queueUpload,
}: HandleRecordedChunkParams) {
  if (blob.size < 1) {
    return
  }

  const session = multipartUploadsRef.current[target]
  if (!session || session.aborted || session.completed || session.uploadError) {
    return
  }

  session.bufferedChunks.push(blob)
  session.bufferedBytes += blob.size
  session.recordedBytes += blob.size

  if (session.bufferedBytes >= MULTIPART_PART_SIZE_BYTES) {
    void queueUpload(target).catch((err) => {
      const activeSession = multipartUploadsRef.current[target]
      if (activeSession) {
        activeSession.uploadError =
          err instanceof Error ? err.message : `Chunk upload failed for ${target} recording.`
      }
    })
  }
}
