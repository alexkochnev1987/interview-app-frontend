import type { TakeStage } from '@/components/take/types'
import type { TakeInterviewData } from '@/lib/api'

import { canStartNewAttempt, type AnswerAttemptMeta } from './attempt-limit'
import { isLastInterviewQuestion } from './messages'

export type ClientInterviewLoadMode = 'initial' | 'resume' | 'locale'

export type PendingVersionAction = 'submit' | 'rerecord' | null
export type VersionPersistKind = Exclude<PendingVersionAction, null>

export type InterviewLoadMode = 'initial' | 'resume' | 'returning'

export type QuestionAnswerPhase = 'recording' | 'review' | 'blocked'

export type ExhaustedHint = 'submit' | 'no-media'

export function resolveQuestionAnswerPhase(
  interview: TakeInterviewData | null | undefined,
): QuestionAnswerPhase {
  const meta = answerAttemptMetaFromInterview(interview)
  if (!isAttemptsExhausted(meta)) {
    return 'recording'
  }
  if (interview?.currentAnswerMeta?.hasSubmittableMedia) {
    return 'review'
  }
  return 'blocked'
}

export function stageAfterInterviewLoad(
  interview: TakeInterviewData,
  mode: InterviewLoadMode,
): TakeStage {
  if (interview.completed) {
    return 'complete'
  }
  if (mode === 'initial') {
    return 'consent'
  }
  if (mode === 'returning') {
    const exhausted = isAttemptsExhausted(answerAttemptMetaFromInterview(interview))
    if (
      exhausted &&
      isLastInterviewQuestion(interview.currentQuestionIndex, interview.totalQuestions)
    ) {
      return 'interview'
    }
    return 'lobby'
  }
  return 'interview'
}

export function resolveInterviewLoadMode(
  mode: ClientInterviewLoadMode,
  options: { serverPrefetched?: boolean },
): InterviewLoadMode {
  if (mode === 'resume' || mode === 'locale') {
    return 'resume'
  }
  return options.serverPrefetched ? 'returning' : 'initial'
}

export function answerAttemptMetaFromInterview(
  interview: TakeInterviewData | null | undefined,
): AnswerAttemptMeta | undefined {
  if (!interview) {
    return undefined
  }
  const meta = interview.currentAnswerMeta
  return {
    versionCount: meta?.versionCount,
    selectedVersionNumber: meta?.selectedVersionNumber,
    maxAttempts: interview.maxAttempts,
  }
}

export function isAttemptsExhausted(meta?: AnswerAttemptMeta): boolean {
  return !canStartNewAttempt(meta)
}

export function shouldCleanupExhaustedSession(params: {
  phase: QuestionAnswerPhase
  recording: boolean
  recordingStartBusy: boolean
  hasActiveMultipart: boolean
}): boolean {
  if (params.phase === 'recording') {
    return false
  }
  if (params.recording || params.recordingStartBusy || params.hasActiveMultipart) {
    return false
  }
  return true
}

export function canRequestVersionAction(params: {
  action: PendingVersionAction
  uploading: boolean
  recording: boolean
}) {
  const { action, uploading, recording } = params
  return Boolean(action && !uploading && recording)
}

export function progressValueForStage(params: { interview: TakeInterviewData; stage: TakeStage }) {
  const { interview, stage } = params
  if (interview.totalQuestions === 0) return 0
  return Math.round(
    ((interview.currentQuestionIndex + (stage === 'complete' ? 1 : 0)) / interview.totalQuestions) *
      100,
  )
}
