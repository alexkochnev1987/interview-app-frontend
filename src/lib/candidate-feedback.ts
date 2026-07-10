import type { Locale } from '@/i18n/locales'

export type CandidateFeedbackEditableState = 'accepted' | 'edited'

export type UpdateCandidateFeedbackOverallPayload = {
  recommendationText: string
  improvementText: string
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

export type CandidateFeedbackBlock = {
  recommendationText?: string | null
  improvementText?: string | null
  state: CandidateFeedbackBlockState
  errorMessage?: string | null
}

export type CandidateFeedbackQuestionBlock = CandidateFeedbackBlock & {
  questionIndex: number
  questionId?: string | null
}

export type CandidateFeedbackResponse = {
  interviewId: string
  interviewLocale: Locale
  overall: CandidateFeedbackBlock
  questionBlocks: CandidateFeedbackQuestionBlock[]
  updatedAt?: string
}

export type ApiCandidateFeedbackBlockDto = {
  recommendationText?: string | null
  improvementText?: string | null
  state?: CandidateFeedbackBlockState | string
  errorMessage?: string | null
}

export type ApiCandidateFeedbackQuestionDto = ApiCandidateFeedbackBlockDto & {
  questionIndex: number
  questionId?: string | null
}

export type ApiCandidateFeedbackDto = {
  interviewId: string
  overall?: ApiCandidateFeedbackBlockDto | null
  questions?: ApiCandidateFeedbackQuestionDto[] | null
  updatedAt?: string
}

const DEFAULT_BLOCK: CandidateFeedbackBlock = {
  recommendationText: null,
  improvementText: null,
  state: 'not_generated',
  errorMessage: null,
}

function normalizeBlockState(state: unknown): CandidateFeedbackBlockState {
  if (
    state === 'not_generated' ||
    state === 'generating' ||
    state === 'generated' ||
    state === 'accepted' ||
    state === 'edited' ||
    state === 'failed'
  ) {
    return state
  }

  return 'not_generated'
}

function mapBlock(
  dto?: ApiCandidateFeedbackBlockDto | null,
): CandidateFeedbackBlock {
  if (!dto) {
    return { ...DEFAULT_BLOCK }
  }

  return {
    recommendationText: dto.recommendationText ?? null,
    improvementText: dto.improvementText ?? null,
    state: normalizeBlockState(dto.state),
    errorMessage: dto.errorMessage ?? null,
  }
}

function mapQuestionBlock(
  dto: ApiCandidateFeedbackQuestionDto,
): CandidateFeedbackQuestionBlock {
  return {
    ...mapBlock(dto),
    questionIndex: dto.questionIndex,
    questionId: dto.questionId ?? null,
  }
}

export function unwrapCandidateFeedbackPayload(
  parsed: unknown,
): ApiCandidateFeedbackDto {
  if (
    parsed &&
    typeof parsed === 'object' &&
    'feedback' in parsed &&
    parsed.feedback &&
    typeof parsed.feedback === 'object'
  ) {
    return parsed.feedback as ApiCandidateFeedbackDto
  }

  return parsed as ApiCandidateFeedbackDto
}

export function mapCandidateFeedbackFromApi(
  dto: ApiCandidateFeedbackDto,
  interviewLocale: Locale,
): CandidateFeedbackResponse {
  return {
    interviewId: dto.interviewId,
    interviewLocale,
    overall: mapBlock(dto.overall),
    questionBlocks: (dto.questions ?? []).map(mapQuestionBlock),
    updatedAt: dto.updatedAt,
  }
}

export function parseCandidateFeedbackBody(
  body: string,
  interviewId: string,
  interviewLocale: Locale,
): CandidateFeedbackResponse {
  if (!body.trim()) {
    return createEmptyCandidateFeedback(interviewId, interviewLocale)
  }

  const parsed = JSON.parse(body) as unknown
  const dto = unwrapCandidateFeedbackPayload(parsed)

  return mapCandidateFeedbackFromApi(
    {
      ...dto,
      interviewId: dto.interviewId ?? interviewId,
    },
    interviewLocale,
  )
}

export function createEmptyCandidateFeedback(
  interviewId: string,
  interviewLocale: Locale = 'en',
): CandidateFeedbackResponse {
  return {
    interviewId,
    interviewLocale,
    overall: { ...DEFAULT_BLOCK },
    questionBlocks: [],
  }
}

export function isCandidateFeedbackEmpty(
  questionCount: number,
  feedback: CandidateFeedbackResponse,
): boolean {
  if (feedback.overall.state !== 'not_generated') {
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
        errorMessage: null,
      }
    )
  })
}

export function isCandidateFeedbackGenerating(
  feedback: CandidateFeedbackResponse,
): boolean {
  if (feedback.overall.state === 'generating') {
    return true
  }

  return feedback.questionBlocks.some((block) => block.state === 'generating')
}

export function canGenerateQuestionBlock(
  state: CandidateFeedbackBlockState,
): boolean {
  return (
    state === 'not_generated' || state === 'generated' || state === 'failed'
  )
}

export function shouldShowQuestionGenerateButton(
  state: CandidateFeedbackBlockState,
): boolean {
  return canGenerateQuestionBlock(state) || state === 'generating'
}

export function getQuestionGenerateLabelKey(
  state: CandidateFeedbackBlockState,
): 'generateQuestion' | 'regenerateQuestion' {
  return state === 'generated' || state === 'failed'
    ? 'regenerateQuestion'
    : 'generateQuestion'
}
