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

export type CandidateFeedbackErrorDisplay =
  | { kind: 'location_not_supported' }
  | { kind: 'raw'; message: string }

export function parseCandidateFeedbackErrorMessage(
  errorMessage: string,
): CandidateFeedbackErrorDisplay {
  const trimmed = errorMessage.trim()
  if (!trimmed) {
    return { kind: 'raw', message: trimmed }
  }

  const geminiJsonMatch = trimmed.match(/Gemini error \d+:\s*(\{[\s\S]*\})/i)
  const jsonCandidate =
    geminiJsonMatch?.[1] ?? (trimmed.startsWith('{') ? trimmed : null)

  if (jsonCandidate) {
    try {
      const parsed = JSON.parse(jsonCandidate) as {
        error?: { message?: string }
      }
      const nestedMessage = parsed.error?.message?.trim()
      if (nestedMessage) {
        return parseCandidateFeedbackErrorMessage(nestedMessage)
      }
    } catch {
      /* fall through to raw matching */
    }
  }

  if (trimmed.includes('User location is not supported')) {
    return { kind: 'location_not_supported' }
  }

  return { kind: 'raw', message: trimmed }
}

function collectFailedBlockMessages(
  feedback: CandidateFeedbackResponse,
  questionCount: number,
): string[] {
  const messages: string[] = []

  if (feedback.overall.state === 'failed') {
    const message = feedback.overall.errorMessage?.trim()
    if (message) {
      messages.push(message)
    }
  }

  for (const block of buildQuestionBlocksView(questionCount, feedback)) {
    if (block.state === 'failed') {
      const message = block.errorMessage?.trim()
      if (message) {
        messages.push(message)
      }
    }
  }

  return messages
}

export function getSharedCandidateFeedbackError(
  feedback: CandidateFeedbackResponse,
  questionCount: number,
): string | null {
  const messages = collectFailedBlockMessages(feedback, questionCount)
  if (messages.length < 2) {
    return null
  }

  const firstMessage = messages[0]
  return messages.every((message) => message === firstMessage) ? firstMessage : null
}

export function hasGeneratedCandidateFeedbackBlocks(
  feedback: CandidateFeedbackResponse,
  questionCount: number,
): boolean {
  if (feedback.overall.state === 'generated') {
    return true
  }

  return buildQuestionBlocksView(questionCount, feedback).some(
    (block) => block.state === 'generated',
  )
}

export function buildAcceptAllCandidateFeedbackPayload(
  feedback: CandidateFeedbackResponse,
  questionCount: number,
): UpdateCandidateFeedbackPayload {
  const payload: UpdateCandidateFeedbackPayload = {}

  if (feedback.overall.state === 'generated') {
    payload.overall = {
      recommendationText: feedback.overall.recommendationText ?? '',
      improvementText: feedback.overall.improvementText ?? '',
      state: 'accepted',
    }
  }

  const generatedQuestions = buildQuestionBlocksView(questionCount, feedback)
    .filter((block) => block.state === 'generated')
    .map((block) => ({
      questionIndex: block.questionIndex,
      recommendationText: block.recommendationText ?? '',
      improvementText: block.improvementText ?? '',
      state: 'accepted' as const,
    }))

  if (generatedQuestions.length > 0) {
    payload.questions = generatedQuestions
  }

  return payload
}

export function isBlockUsingSharedCandidateFeedbackError(
  block: CandidateFeedbackBlock,
  sharedError: string | null,
): boolean {
  return (
    Boolean(sharedError) &&
    block.state === 'failed' &&
    block.errorMessage?.trim() === sharedError
  )
}

export function isAcceptAllCandidateFeedbackPayloadEmpty(
  payload: UpdateCandidateFeedbackPayload,
): boolean {
  return !payload.overall && (payload.questions?.length ?? 0) === 0
}
