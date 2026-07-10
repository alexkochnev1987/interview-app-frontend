import type { Locale } from '@/i18n/locales'

export type CandidateFeedbackEditableState = 'accepted' | 'edited'

export type UpdateCandidateFeedbackOverallPayload = {
  text: string
  state: CandidateFeedbackEditableState
}

export type UpdateCandidateFeedbackQuestionPayload = {
  questionIndex: number
  recommendationText: string
  improvementText: string
  state: CandidateFeedbackEditableState
}

export type UpdateCandidateFeedbackPayload = {
  overall?: UpdateCandidateFeedbackOverallPayload
  questions?: UpdateCandidateFeedbackQuestionPayload[]
}

export type CandidateFeedbackBlockState =
  | 'not_generated'
  | 'generating'
  | 'generated'
  | 'accepted'
  | 'edited'
  | 'failed'

export type CandidateFeedbackQuestionBlock = {
  questionIndex: number
  recommendationText?: string | null
  improvementText?: string | null
  state: CandidateFeedbackBlockState
}

export type CandidateFeedbackResponse = {
  interviewId: string
  interviewLocale: Locale
  overallText?: string | null
  overallState: CandidateFeedbackBlockState
  questionBlocks: CandidateFeedbackQuestionBlock[]
}

export function createEmptyCandidateFeedback(
  interviewId: string,
  interviewLocale: Locale = 'en',
): CandidateFeedbackResponse {
  return {
    interviewId,
    interviewLocale,
    overallText: null,
    overallState: 'not_generated',
    questionBlocks: [],
  }
}

export function isCandidateFeedbackEmpty(
  questionCount: number,
  feedback: CandidateFeedbackResponse,
): boolean {
  if (feedback.overallState !== 'not_generated') {
    return false
  }

  const blocks = buildQuestionBlocksView(questionCount, feedback)
  return blocks.every((block) => block.state === 'not_generated')
}

export function isQuestionBlockGenerationBusy(
  blockState: CandidateFeedbackBlockState,
  questionIndex: number,
  generatingTarget: 'all' | `question-${number}` | null,
): boolean {
  return (
    generatingTarget === 'all' ||
    generatingTarget === `question-${questionIndex}` ||
    blockState === 'generating'
  )
}

export function isOverallBlockGenerationBusy(
  overallState: CandidateFeedbackBlockState,
  generatingTarget: 'all' | `question-${number}` | null,
): boolean {
  return generatingTarget === 'all' || overallState === 'generating'
}

export function candidateFeedbackPath(interviewId: string): string {
  return `/interviews/${encodeURIComponent(interviewId)}/candidate-feedback`
}

export function buildQuestionBlocksView(
  questionCount: number,
  feedback: CandidateFeedbackResponse,
): CandidateFeedbackQuestionBlock[] {
  const byIndex = new Map(
    feedback.questionBlocks.map((block) => [block.questionIndex, block]),
  )

  return Array.from({ length: questionCount }, (_, questionIndex) => {
    return (
      byIndex.get(questionIndex) ?? {
        questionIndex,
        recommendationText: null,
        improvementText: null,
        state: 'not_generated' as const,
      }
    )
  })
}

export function isCandidateFeedbackGenerating(
  feedback: CandidateFeedbackResponse,
): boolean {
  if (feedback.overallState === 'generating') {
    return true
  }

  return feedback.questionBlocks.some((block) => block.state === 'generating')
}

export function canGenerateQuestionBlock(
  state: CandidateFeedbackBlockState,
): boolean {
  return state === 'not_generated' || state === 'failed'
}
