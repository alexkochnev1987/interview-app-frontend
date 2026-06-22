import type { Answer } from '@/lib/api'

import type { QuestionUploadState } from '@/app/[locale]/interviews/[id]/interview-detail-types'

export interface AnswerStatusPill {
  tone: 'completed' | 'processing' | 'failed' | 'pending'
  labelKey: string
}

export function formatAnswerDuration(
  seconds: number | undefined,
  emptyLabel: string,
) {
  if (!seconds || seconds < 1) {
    return emptyLabel
  }

  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number | undefined, emptyLabel: string) {
  if (!bytes || bytes < 1) {
    return emptyLabel
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatWorkflowStage(
  stage: string | undefined,
  idleLabel: string,
) {
  if (!stage) {
    return idleLabel
  }

  return stage.replaceAll('_', ' ')
}

export function getValidationTone(
  status?: string,
): 'neutral' | 'processing' | 'completed' | 'failed' {
  if (status === 'queued' || status === 'processing') {
    return 'processing'
  }
  if (status === 'completed') {
    return 'completed'
  }
  if (status === 'failed') {
    return 'failed'
  }
  return 'neutral'
}

export function formatCandidateLinkPreview(candidateLink: string) {
  if (!candidateLink) {
    return ''
  }

  try {
    const url = new URL(candidateLink)
    const token = url.searchParams.get('token')
    const shortToken = token
      ? `${token.slice(0, 12)}...${token.slice(-8)}`
      : null

    return `${url.origin}${url.pathname}${shortToken ? `?token=${shortToken}` : ''}`
  } catch {
    if (candidateLink.length <= 96) {
      return candidateLink
    }

    return `${candidateLink.slice(0, 72)}...${candidateLink.slice(-20)}`
  }
}

// Precedence matters: submitted -> draft -> uploading -> error -> pending.
export function getAnswerStatusPill(
  answer: Answer | undefined,
  uploadState: QuestionUploadState,
): AnswerStatusPill {
  const hasAnswer = Boolean(answer)

  if (answer?.status === 'submitted') {
    return { tone: 'completed', labelKey: 'answerSubmitted' }
  }
  if (hasAnswer || uploadState.status === 'uploaded') {
    return { tone: 'processing', labelKey: 'answerDraft' }
  }
  if (uploadState.status === 'uploading') {
    return { tone: 'processing', labelKey: 'answerUploading' }
  }
  if (uploadState.status === 'error') {
    return { tone: 'failed', labelKey: 'answerUploadFailed' }
  }
  return { tone: 'pending', labelKey: 'answerPending' }
}
