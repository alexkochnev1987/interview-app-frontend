import { request, requestVoid } from './client';

type CaptureTarget = 'camera' | 'screen';

interface ProgressBehaviorSignals {
  tabHiddenCount: number;
  windowBlurCount: number;
  pasteCount: number;
  keydownCount: number;
  resizeCount: number;
}

interface ProgressBehaviorEvent {
  eventType: 'tab_hidden' | 'window_blur' | 'paste' | 'keydown' | 'resize';
  occurredAt: string;
  versionNumber: number;
}

interface ClientTranscriptPayload {
  text: string;
  language: string;
  provider: string;
  generatedAt: string;
  isFinal: boolean;
}

export interface TakeInterviewData {
  id: string;
  position: string;
  candidateName: string;
  totalQuestions: number;
  currentQuestion: { text: string } | null;
  currentQuestionIndex: number;
  currentAnswerMeta: {
    status: 'recording' | 'submitted';
    versionCount: number;
    selectedVersionNumber: number;
  } | null;
  completed: boolean;
}

export interface MultipartUploadSessionResponse {
  mediaKey: string;
  uploadId: string;
}

export interface MultipartUploadPartResponse {
  mediaKey: string;
  uploadId: string;
  partNumber: number;
  uploadUrl: string;
}

export interface TakeProgressPayload {
  questionIndex: number;
  versionNumber: number;
  mediaKey: string;
  screenMediaKey?: string;
  durationSeconds?: number;
  startedAt?: string;
  submittedAt?: string;
  cameraFileSizeBytes?: number;
  screenFileSizeBytes?: number;
  behaviorSignals: ProgressBehaviorSignals;
  behaviorEvents: ProgressBehaviorEvent[];
  clientTranscript?: ClientTranscriptPayload;
}

export interface SubmitTakeAnswerPayload extends TakeProgressPayload {
  submitAnswer: boolean;
}

export async function getTakeInterview(
  id: string,
  token?: string,
): Promise<TakeInterviewData> {
  try {
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return await request<TakeInterviewData>(`/take/${id}${query}`);
  } catch {
    throw new Error('Invalid or expired interview link');
  }
}

export async function startMultipartUpload(
  questionIndex: number,
  mediaType: CaptureTarget,
): Promise<MultipartUploadSessionResponse> {
  try {
    return await request<MultipartUploadSessionResponse>('/upload/multipart/start', {
      method: 'POST',
      body: JSON.stringify({
        questionIndex,
        contentType: 'video/webm',
        mediaType,
      }),
    });
  } catch {
    throw new Error(`Failed to initialize ${mediaType} upload for this answer version.`);
  }
}

export async function sendTakeAnswerProgress(
  id: string,
  payload: TakeProgressPayload,
): Promise<void> {
  try {
    await requestVoid(`/take/${id}/answer/progress`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Failed to save interview progress.');
  }
}

export async function presignMultipartPart(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
  partNumber: number,
): Promise<MultipartUploadPartResponse> {
  try {
    return await request<MultipartUploadPartResponse>('/upload/multipart/part', {
      method: 'POST',
      body: JSON.stringify({
        questionIndex,
        mediaKey,
        uploadId,
        partNumber,
      }),
    });
  } catch {
    throw new Error(`Failed to prepare upload chunk ${partNumber}.`);
  }
}

export async function uploadMultipartPart(uploadUrl: string, partBlob: Blob): Promise<void> {
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: partBlob,
    headers: { 'Content-Type': 'video/webm' },
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
  try {
    await requestVoid('/upload/multipart/complete', {
      method: 'POST',
      body: JSON.stringify({
        questionIndex,
        mediaKey,
        uploadId,
      }),
    });
  } catch {
    throw new Error('Failed to finalize upload.');
  }
}

export async function abortMultipartUpload(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
): Promise<void> {
  await requestVoid('/upload/multipart/abort', {
    method: 'POST',
    body: JSON.stringify({
      questionIndex,
      mediaKey,
      uploadId,
    }),
  });
}

export async function submitTakeAnswer(
  id: string,
  payload: SubmitTakeAnswerPayload,
): Promise<void> {
  try {
    await requestVoid(`/take/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(payload.submitAnswer ? 'Answer submission failed.' : 'Re-record version could not be saved.');
  }
}
