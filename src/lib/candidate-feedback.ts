import type { Locale } from '@/i18n/locales'

export type CandidateFeedbackSkipReason =
  | 'locked'
  | 'in_progress'
  | 'not_submitted'
  | 'missing_answer'
  | 'stale_validation'
  | 'missing_transcript'
  | 'missing_question'
  | 'unusable_transcript'
  | 'off_topic'
  | 'not_addressed'
  | 'no_question_texts'

export type CandidateFeedbackEligibilitySkipReason =
  | 'not_submitted'
  | 'missing_answer'
  | 'missing_transcript'
  | 'unusable_transcript'

const CANDIDATE_FEEDBACK_ELIGIBILITY_SKIP_REASONS =
  new Set<CandidateFeedbackEligibilitySkipReason>([
    'not_submitted',
    'missing_answer',
    'missing_transcript',
    'unusable_transcript',
  ])

const CANDIDATE_FEEDBACK_SKIP_REASONS = new Set<CandidateFeedbackSkipReason>([
  'locked',
  'in_progress',
  'not_submitted',
  'missing_answer',
  'stale_validation',
  'missing_transcript',
  'missing_question',
  'unusable_transcript',
  'off_topic',
  'not_addressed',
  'no_question_texts',
])

export type GenerateAllCandidateFeedbackQuestionResult = {
  status: 'queued' | 'generated' | 'skipped' | 'failed'
  questionIndex: number
  reason?: CandidateFeedbackSkipReason | string
  errorMessage?: string
}

export type GenerateAllCandidateFeedbackOverallResult = {
  status: 'queued' | 'generated' | 'skipped' | 'failed'
  reason?: CandidateFeedbackSkipReason | string
  errorMessage?: string
}

export type GenerateAllCandidateFeedbackPlan = {
  questions: GenerateAllCandidateFeedbackQuestionResult[]
  overall: GenerateAllCandidateFeedbackOverallResult
}

export type GenerateAllCandidateFeedbackOutcome = {
  feedback: CandidateFeedbackResponse
  plan?: GenerateAllCandidateFeedbackPlan
}

export type CandidateFeedbackEditableState = 'accepted' | 'edited'

export type CandidateFeedbackOutcome =
  | 'next_stage'
  | 'keep_in_touch'
  | 'custom'

export const CANDIDATE_FEEDBACK_OUTCOMES = [
  'next_stage',
  'keep_in_touch',
  'custom',
] as const satisfies readonly CandidateFeedbackOutcome[]

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
  outcome?: CandidateFeedbackOutcome | null
  outcomeMessage?: string | null
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
  outcome?: CandidateFeedbackOutcome | null
  outcomeMessage?: string | null
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
  outcome?: CandidateFeedbackOutcome | null
  outcomeMessage?: string | null
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

function normalizeOutcome(
  outcome: unknown,
): CandidateFeedbackOutcome | undefined {
  if (
    outcome === 'next_stage' ||
    outcome === 'keep_in_touch' ||
    outcome === 'custom'
  ) {
    return outcome
  }
  return undefined
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
    outcome: normalizeOutcome(dto.outcome),
    outcomeMessage: dto.outcomeMessage?.trim() || undefined,
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

export function canRegenerateAnyCandidateFeedbackBlock(
  questionCount: number,
  feedback: CandidateFeedbackResponse,
): boolean {
  if (canGenerateQuestionBlock(feedback.overall.state)) {
    return true
  }

  return buildQuestionBlocksView(questionCount, feedback).some((block) =>
    canGenerateQuestionBlock(block.state),
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
  | { kind: 'skip_reason'; reason: CandidateFeedbackSkipReason }
  | { kind: 'raw'; message: string }

export function parseCandidateFeedbackSkipReason(
  value: string | null | undefined,
): CandidateFeedbackSkipReason | null {
  const trimmed = value?.trim()
  if (!trimmed || !CANDIDATE_FEEDBACK_SKIP_REASONS.has(trimmed as CandidateFeedbackSkipReason)) {
    return null
  }

  return trimmed as CandidateFeedbackSkipReason
}

export function isCandidateFeedbackSkipReason(
  display: CandidateFeedbackErrorDisplay,
): display is { kind: 'skip_reason'; reason: CandidateFeedbackSkipReason } {
  return display.kind === 'skip_reason'
}

export function isCandidateFeedbackEligibilitySkipReason(
  reason: CandidateFeedbackSkipReason | null | undefined,
): reason is CandidateFeedbackEligibilitySkipReason {
  return (
    reason != null &&
    CANDIDATE_FEEDBACK_ELIGIBILITY_SKIP_REASONS.has(
      reason as CandidateFeedbackEligibilitySkipReason,
    )
  )
}

export function getCandidateFeedbackBlockSkipReason(
  block: Pick<CandidateFeedbackBlock, 'errorMessage'>,
): CandidateFeedbackSkipReason | null {
  return parseCandidateFeedbackSkipReason(block.errorMessage)
}

export function isSystemPrefilledCandidateFeedbackBlock(
  block: Pick<
    CandidateFeedbackBlock,
    'state' | 'errorMessage' | 'recommendationText' | 'improvementText'
  >,
): boolean {
  if (block.state !== 'edited') {
    return false
  }

  const reason = getCandidateFeedbackBlockSkipReason(block)
  if (!isCandidateFeedbackEligibilitySkipReason(reason)) {
    return false
  }

  return Boolean(
    block.recommendationText?.trim() || block.improvementText?.trim(),
  )
}

export function isCandidateFeedbackSkippedFailureBlock(
  block: Pick<CandidateFeedbackBlock, 'state' | 'errorMessage'>,
): boolean {
  return (
    block.state === 'failed' &&
    Boolean(getCandidateFeedbackBlockSkipReason(block))
  )
}

export function parseCandidateFeedbackErrorMessage(
  errorMessage: string,
): CandidateFeedbackErrorDisplay {
  const trimmed = errorMessage.trim()
  if (!trimmed) {
    return { kind: 'raw', message: trimmed }
  }

  const skipReason = parseCandidateFeedbackSkipReason(trimmed)
  if (skipReason) {
    return { kind: 'skip_reason', reason: skipReason }
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
  if (parseCandidateFeedbackSkipReason(firstMessage)) {
    return null
  }

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

export function isPublishableCandidateFeedbackBlock(
  block: Pick<
    CandidateFeedbackBlock,
    'state' | 'recommendationText' | 'improvementText'
  >,
): boolean {
  if (block.state !== 'accepted' && block.state !== 'edited') {
    return false
  }

  return Boolean(
    block.recommendationText?.trim() || block.improvementText?.trim(),
  )
}

/** True when at least one accepted/edited block has publishable text (share-link gate). */
export function hasPublishableCandidateFeedback(
  feedback: CandidateFeedbackResponse,
  questionCount: number,
): boolean {
  if (isPublishableCandidateFeedbackBlock(feedback.overall)) {
    return true
  }

  return buildQuestionBlocksView(questionCount, feedback).some(
    isPublishableCandidateFeedbackBlock,
  )
}

function hasCandidateFeedbackBlockText(
  block: Pick<CandidateFeedbackBlock, 'recommendationText' | 'improvementText'>,
): boolean {
  return Boolean(
    block.recommendationText?.trim() || block.improvementText?.trim(),
  )
}

/**
 * Builds the PATCH text payload for Save.
 * For `generated` blocks, an untouched empty draft pair keeps the AI texts
 * (so HR can save/accept without retyping both fields). A single non-empty
 * draft field is enough; the other may stay empty.
 */
export function resolveCandidateFeedbackSavePayload(
  block: Pick<
    CandidateFeedbackBlock,
    'state' | 'recommendationText' | 'improvementText'
  >,
  drafts: { recommendationText: string; improvementText: string },
): { recommendationText: string; improvementText: string } | null {
  const draftRecommendation = drafts.recommendationText
  const draftImprovement = drafts.improvementText
  const bothDraftsEmpty =
    !draftRecommendation.trim() && !draftImprovement.trim()

  if (bothDraftsEmpty && block.state === 'generated') {
    const recommendationText = block.recommendationText ?? ''
    const improvementText = block.improvementText ?? ''
    if (!hasCandidateFeedbackBlockText({ recommendationText, improvementText })) {
      return null
    }
    return { recommendationText, improvementText }
  }

  if (
    !hasCandidateFeedbackBlockText({
      recommendationText: draftRecommendation,
      improvementText: draftImprovement,
    })
  ) {
    return null
  }

  return {
    recommendationText: draftRecommendation,
    improvementText: draftImprovement,
  }
}

export function buildAcceptAllCandidateFeedbackPayload(
  feedback: CandidateFeedbackResponse,
  questionCount: number,
): UpdateCandidateFeedbackPayload {
  const payload: UpdateCandidateFeedbackPayload = {}

  if (
    feedback.overall.state === 'generated' &&
    hasCandidateFeedbackBlockText(feedback.overall)
  ) {
    payload.overall = {
      recommendationText: feedback.overall.recommendationText ?? '',
      improvementText: feedback.overall.improvementText ?? '',
      state: 'accepted',
    }
  }

  const generatedQuestions = buildQuestionBlocksView(questionCount, feedback)
    .filter(
      (block) =>
        block.state === 'generated' && hasCandidateFeedbackBlockText(block),
    )
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

function resolveGenerateAllSkipReason(
  result: Pick<
    GenerateAllCandidateFeedbackQuestionResult,
    'reason' | 'errorMessage'
  >,
): CandidateFeedbackSkipReason | null {
  return (
    parseCandidateFeedbackSkipReason(result.reason) ??
    parseCandidateFeedbackSkipReason(result.errorMessage)
  )
}

export function getSkippedGenerateAllQuestionResults(
  questions: GenerateAllCandidateFeedbackQuestionResult[] | undefined,
): GenerateAllCandidateFeedbackQuestionResult[] {
  return (questions ?? []).filter((question) => question.status === 'skipped')
}

export type GenerateAllQuestionSkipEntry = {
  questionIndex: number
  reason: CandidateFeedbackSkipReason | null
}

export function buildGenerateAllQuestionSkipEntries(
  skippedQuestions: GenerateAllCandidateFeedbackQuestionResult[],
): GenerateAllQuestionSkipEntry[] {
  return skippedQuestions
    .slice()
    .sort((left, right) => left.questionIndex - right.questionIndex)
    .map((question) => ({
      questionIndex: question.questionIndex,
      reason: resolveGenerateAllSkipReason(question),
    }))
}

export function resolveGenerateAllOverallSkipReason(
  overall: GenerateAllCandidateFeedbackOverallResult | undefined,
): CandidateFeedbackSkipReason | null {
  if (overall?.status !== 'skipped') {
    return null
  }

  return (
    parseCandidateFeedbackSkipReason(overall.reason) ??
    parseCandidateFeedbackSkipReason(overall.errorMessage)
  )
}

export type GenerateAllStartToastKind =
  | 'started'
  | 'stale_validation'
  | 'locked_only'
  | 'nothing_to_generate'

export function isGenerateAllPlanQueued(
  plan: GenerateAllCandidateFeedbackPlan | undefined,
): boolean {
  if (!plan) {
    return true
  }

  if (plan.overall.status === 'queued') {
    return true
  }

  return plan.questions.some((question) => question.status === 'queued')
}

export function resolveGenerateAllStartToastKind(
  plan: GenerateAllCandidateFeedbackPlan | undefined,
): GenerateAllStartToastKind {
  if (isGenerateAllPlanQueued(plan)) {
    return 'started'
  }

  const skipReasons = [
    ...getSkippedGenerateAllQuestionResults(plan?.questions).map(
      resolveGenerateAllSkipReason,
    ),
    resolveGenerateAllOverallSkipReason(plan?.overall),
  ].filter((reason): reason is CandidateFeedbackSkipReason => reason != null)

  if (skipReasons.includes('stale_validation')) {
    return 'stale_validation'
  }

  if (skipReasons.length > 0 && skipReasons.every((reason) => reason === 'locked')) {
    return 'locked_only'
  }

  return 'nothing_to_generate'
}

export function parseGenerateAllCandidateFeedbackPostBody(body: string): {
  plan?: GenerateAllCandidateFeedbackPlan
  feedbackDto?: ApiCandidateFeedbackDto
} {
  if (!body.trim()) {
    return {}
  }

  try {
    const parsed = JSON.parse(body) as {
      feedback?: ApiCandidateFeedbackDto
      questions?: GenerateAllCandidateFeedbackQuestionResult[]
      overall?: GenerateAllCandidateFeedbackOverallResult
    }

    const result: {
      plan?: GenerateAllCandidateFeedbackPlan
      feedbackDto?: ApiCandidateFeedbackDto
    } = {}

    if (parsed.questions !== undefined || parsed.overall !== undefined) {
      result.plan = {
        questions: parsed.questions ?? [],
        overall: parsed.overall ?? { status: 'queued' },
      }
    }

    if (parsed.feedback) {
      result.feedbackDto = parsed.feedback
    }

    return result
  } catch {
    return {}
  }
}
