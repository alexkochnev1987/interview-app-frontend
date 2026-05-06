import type { MultipartUploadPartResponse } from '@/lib/api';

import type { CaptureTarget, MultipartUploadSession, MultipartUploadState } from './runtime';

const MULTIPART_PART_SIZE_BYTES = 6 * 1024 * 1024;

interface QueueBufferedUploadParams {
  target: CaptureTarget;
  multipartUploadsRef: { current: MultipartUploadState };
  forceFinal?: boolean;
  preSignMultipartPartUpload: (
    target: CaptureTarget,
    session: MultipartUploadSession,
    partNumber: number,
  ) => Promise<MultipartUploadPartResponse>;
  uploadMultipartPart: (uploadUrl: string, partBlob: Blob) => Promise<void>;
}

export function queueBufferedUpload({
  target,
  multipartUploadsRef,
  forceFinal = false,
  preSignMultipartPartUpload,
  uploadMultipartPart,
}: QueueBufferedUploadParams) {
  const session = multipartUploadsRef.current[target];
  if (!session) {
    return Promise.resolve();
  }

  session.uploadChain = session.uploadChain.then(async () => {
    let activeSession = multipartUploadsRef.current[target];

    while (
      activeSession &&
      !activeSession.aborted &&
      !activeSession.completed &&
      (activeSession.bufferedBytes >= MULTIPART_PART_SIZE_BYTES ||
        (forceFinal && activeSession.bufferedBytes > 0))
    ) {
      const partBlob = new Blob(activeSession.bufferedChunks, { type: 'video/webm' });
      activeSession.bufferedChunks = [];
      activeSession.bufferedBytes = 0;

      const partNumber = activeSession.nextPartNumber;
      activeSession.nextPartNumber += 1;

      const partUpload = await preSignMultipartPartUpload(
        target,
        activeSession,
        partNumber,
      );

      try {
        await uploadMultipartPart(partUpload.uploadUrl, partBlob);
      } catch {
        throw new Error(`Chunk upload failed for ${target} recording.`);
      }

      activeSession = multipartUploadsRef.current[target];
      if (activeSession) {
        activeSession.uploadedPartCount += 1;
      }
    }
  });

  return session.uploadChain;
}

interface HandleRecordedChunkParams {
  target: CaptureTarget;
  blob: Blob;
  multipartUploadsRef: { current: MultipartUploadState };
  queueBufferedUpload: (target: CaptureTarget, forceFinal?: boolean) => Promise<void>;
}

export function handleRecordedChunk({
  target,
  blob,
  multipartUploadsRef,
  queueBufferedUpload,
}: HandleRecordedChunkParams) {
  if (blob.size < 1) {
    return;
  }

  const session = multipartUploadsRef.current[target];
  if (!session || session.aborted || session.completed) {
    return;
  }

  session.bufferedChunks.push(blob);
  session.bufferedBytes += blob.size;
  session.recordedBytes += blob.size;

  if (session.bufferedBytes >= MULTIPART_PART_SIZE_BYTES) {
    void queueBufferedUpload(target).catch(() => undefined);
  }

}
