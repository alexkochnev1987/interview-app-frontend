import { client, handle } from './client';
import type {
  CaptureTarget,
  MultipartUploadPartResponse,
  MultipartUploadSessionResponse,
} from './types';

export const RECORDING_CONTENT_TYPE = 'video/webm' as const;

export async function startMultipartUpload(
  questionIndex: number,
  mediaType: CaptureTarget,
  contentType: typeof RECORDING_CONTENT_TYPE = RECORDING_CONTENT_TYPE,
): Promise<MultipartUploadSessionResponse> {
  return handle(client.POST('/upload/multipart/start', {
    body: {
      questionIndex,
      contentType,
      mediaType,
    }
  }));
}

export async function presignMultipartPart(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
  partNumber: number,
): Promise<MultipartUploadPartResponse> {
  return handle(client.POST('/upload/multipart/part', {
    body: {
      questionIndex,
      mediaKey,
      uploadId,
      partNumber,
    }
  }));
}

export async function uploadMultipartPart(uploadUrl: string, partBlob: Blob): Promise<void> {
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: partBlob,
    headers: { 'Content-Type': RECORDING_CONTENT_TYPE },
  });
  if (!uploadResponse.ok) {
    throw new Error('Chunk upload failed for recording.');
  }
}

export async function completeMultipartUpload(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
): Promise<void> {
  await handle(client.POST('/upload/multipart/complete', {
    body: {
      questionIndex,
      mediaKey,
      uploadId,
    }
  }));
}

export async function abortMultipartUpload(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
): Promise<void> {
  await handle(client.POST('/upload/multipart/abort', {
    body: {
      questionIndex,
      mediaKey,
      uploadId,
    }
  }));
}
