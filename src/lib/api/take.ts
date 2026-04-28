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
  const apiUrl = token ? `/api/take/${id}?token=${encodeURIComponent(token)}` : `/api/take/${id}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Invalid or expired interview link');
  }
  return (await response.json()) as TakeInterviewData;
}

export async function startMultipartUpload(
  questionIndex: number,
  mediaType: CaptureTarget,
): Promise<MultipartUploadSessionResponse> {
  const response = await fetch('/api/upload/multipart/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionIndex,
      contentType: 'video/webm',
      mediaType,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to initialize ${mediaType} upload for this answer version.`);
  }
  return (await response.json()) as MultipartUploadSessionResponse;
}

export async function sendTakeAnswerProgress(
  id: string,
  payload: TakeProgressPayload,
): Promise<void> {
  const response = await fetch(`/api/take/${id}/answer/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to save interview progress.');
  }
}

export async function presignMultipartPart(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
  partNumber: number,
): Promise<MultipartUploadPartResponse> {
  const response = await fetch('/api/upload/multipart/part', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionIndex,
      mediaKey,
      uploadId,
      partNumber,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to prepare upload chunk ${partNumber}.`);
  }
  return (await response.json()) as MultipartUploadPartResponse;
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
  const response = await fetch('/api/upload/multipart/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionIndex,
      mediaKey,
      uploadId,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to finalize upload.');
  }
}

export async function abortMultipartUpload(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
): Promise<void> {
  await fetch('/api/upload/multipart/abort', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const response = await fetch(`/api/take/${id}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(payload.submitAnswer ? 'Answer submission failed.' : 'Re-record version could not be saved.');
  }
}
