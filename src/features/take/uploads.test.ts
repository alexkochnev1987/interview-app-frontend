import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { completeMultipartUpload } from './uploads';
import type { MultipartUploadSession } from './runtime';

function sessionFixture(
  overrides: Partial<MultipartUploadSession> = {},
): MultipartUploadSession {
  return {
    questionIndex: 0,
    mediaKey: 'uploads/interviews/x/answers/q0-camera-1.webm',
    uploadId: 'upload-1',
    versionNumber: 1,
    recordingSessionId: 'session-1',
    nextPartNumber: 2,
    uploadedPartCount: 1,
    bufferedChunks: [],
    bufferedBytes: 0,
    recordedBytes: 1024,
    uploadChain: Promise.resolve(),
    completed: false,
    aborted: false,
    mediaKeyPersisted: true,
    ...overrides,
  };
}

describe('completeMultipartUpload', () => {
  it('rethrows ApiError without wrapping', async () => {
    const apiError = new ApiError(409, 'overwrite forbidden', '/uploads', undefined, 'ANSWER_VERSION_OVERWRITE_FORBIDDEN');
    const multipartUploadsRef = { current: { camera: sessionFixture(), screen: null } };
    const completeMultipartUploadRequest = vi.fn().mockRejectedValue(apiError);

    await expect(
      completeMultipartUpload({
        target: 'camera',
        multipartUploadsRef,
        completeMultipartUploadRequest,
      }),
    ).rejects.toBe(apiError);
  });
});
