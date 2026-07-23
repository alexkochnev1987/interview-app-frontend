import type { Answer } from '@/lib/api'
import type { Locale } from '@/i18n/locales'
import { localizedPath } from '@/i18n/pathname'
import { routes } from '@/i18n/routes'

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

/** Shortens path-token share URLs (`/feedback/share/:token`) for display. */
export function formatFeedbackShareLinkPreview(shareLink: string) {
  if (!shareLink) {
    return ''
  }

  try {
    const url = new URL(shareLink)
    const segments = url.pathname.split('/').filter(Boolean)
    const token = segments[segments.length - 1] ?? ''
    if (token.length <= 20) {
      return `${url.origin}${url.pathname}`
    }

    const shortToken = `${token.slice(0, 12)}...${token.slice(-8)}`
    const prefix = segments.slice(0, -1).join('/')
    const path = prefix ? `/${prefix}/${shortToken}` : `/${shortToken}`
    return `${url.origin}${path}`
  } catch {
    return formatCandidateLinkPreview(shareLink)
  }
}

/** Extracts the share token from a backend or absolute share URL. */
export function extractFeedbackShareToken(shareUrl: string): string | null {
  if (!shareUrl.trim()) {
    return null
  }

  try {
    const url = new URL(shareUrl, 'http://localhost')
    const segments = url.pathname.split('/').filter(Boolean)
    const shareIdx = segments.findIndex(
      (segment, index) =>
        segment === 'feedback' && segments[index + 1] === 'share',
    )
    if (shareIdx < 0) {
      return null
    }
    const token = segments[shareIdx + 2]
    return token || null
  } catch {
    return null
  }
}

/**
 * Rebuilds the API share URL on the current origin with the interview locale
 * prefix (mirrors candidate take-link client normalization).
 */
export function buildCandidateFeedbackShareUrl(
  apiUrl: string,
  interviewLocale: Locale,
  origin: string,
): string {
  const token = extractFeedbackShareToken(apiUrl)
  if (!token || !origin) {
    return apiUrl
  }

  return `${origin.replace(/\/$/, '')}${localizedPath(
    routes.feedback.share(token),
    interviewLocale,
  )}`
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
