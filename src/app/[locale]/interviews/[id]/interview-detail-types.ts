export type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error'

export interface QuestionUploadState {
  status: UploadStatus
  errorMessage?: string
}

export interface AnswerMediaState {
  loading: boolean
  cameraUrl?: string
  screenUrl?: string
  errorMessage?: string
}
