import type { CaptureTarget, MultipartUploadState } from './runtime';

interface CompleteMultipartUploadParams {
  target: CaptureTarget;
  multipartUploadsRef: { current: MultipartUploadState };
  questionIndex: number;
  completeMultipartUploadRequest: (
    questionIndex: number,
    mediaKey: string,
    uploadId: string,
  ) => Promise<void>;
}

export async function completeMultipartUpload({
  target,
  multipartUploadsRef,
  questionIndex,
  completeMultipartUploadRequest,
}: CompleteMultipartUploadParams) {
  const session = multipartUploadsRef.current[target];
  if (!session) {
    throw new Error(`${target} upload session is not initialized.`);
  }
  if (session.completed || session.aborted) {
    return;
  }

  try {
    await completeMultipartUploadRequest(questionIndex, session.mediaKey, session.uploadId);
  } catch {
    throw new Error(`Failed to finalize ${target} upload.`);
  }

  session.completed = true;
}

interface AbortMultipartUploadsParams {
  multipartUploadsRef: { current: MultipartUploadState };
  questionIndex: number;
  abortMultipartUploadRequest: (
    questionIndex: number,
    mediaKey: string,
    uploadId: string,
  ) => Promise<void>;
}

export async function abortMultipartUploads({
  multipartUploadsRef,
  questionIndex,
  abortMultipartUploadRequest,
}: AbortMultipartUploadsParams) {
  const uploadsSnapshot = multipartUploadsRef.current;
  const entries = (
    [
      ['camera', uploadsSnapshot.camera],
      ['screen', uploadsSnapshot.screen],
    ] as const
  ).filter(([, session]) => Boolean(session));

  await Promise.all(
    entries.map(async ([target, session]) => {
      if (!session || session.aborted || session.completed) {
        return;
      }

      session.aborted = true;

      try {
        await session.uploadChain.catch(() => undefined);
        await abortMultipartUploadRequest(questionIndex, session.mediaKey, session.uploadId);
      } catch {
        console.error(`Failed to abort ${target} multipart upload.`);
      }
    }),
  );
}
