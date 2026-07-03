import type { Locale } from '@/i18n/locales'
import type { QuestionInput } from '@/lib/api'
import type { components } from '@/lib/api-types'
import {
  hasLocaleDraftContent,
  localeDraftFromInput,
  type LocaleQuestionDraft,
} from '@/lib/question-editor/parsers'

type QuestionDraftInput = components['schemas']['QuestionDraftInputDto']
type DraftQuestionRequest = components['schemas']['DraftQuestionDto']

export function buildAiDraftQuestionInput(args: {
  value: QuestionInput
  contentLocale: Locale
  localeDrafts: Partial<Record<Locale, Partial<LocaleQuestionDraft> | undefined>>
}): QuestionInput {
  const { value, contentLocale, localeDrafts } = args
  const valueDraft = localeDraftFromInput(value)
  const storedDraft = localeDrafts[contentLocale]
  const activeDraft = hasLocaleDraftContent(storedDraft) ? storedDraft! : valueDraft
  return {
    ...value,
    ...activeDraft,
  }
}

export function buildQuestionDraftRequestPayload(
  question: QuestionInput,
  locale: Locale,
): QuestionDraftInput {
  const payload: QuestionDraftInput = {
    questionText: question.questionText?.trim() ?? '',
    primaryLocale: locale,
  }

  if (question.difficulty) {
    payload.difficulty = question.difficulty
  }
  if (question.role?.trim()) {
    payload.role = question.role.trim()
  }
  if (question.focus?.trim()) {
    payload.focus = question.focus.trim()
  }
  if (question.category?.trim()) {
    payload.category = question.category.trim()
  }
  if (question.subcategory?.trim()) {
    payload.subcategory = question.subcategory.trim()
  }
  if (typeof question.weight === 'number') {
    payload.weight = question.weight
  }
  if (typeof question.minimumPassScore === 'number') {
    payload.minimumPassScore = question.minimumPassScore
  }
  if (question.followUpQuestions?.length) {
    payload.followUpQuestions = question.followUpQuestions
  }
  if (question.sampleGoodAnswer?.trim()) {
    payload.sampleGoodAnswer = question.sampleGoodAnswer.trim()
  }
  if (question.tags?.length) {
    payload.tags = question.tags
  }

  return payload
}

export function buildPrimaryTranslateQuestionInput(
  question: QuestionInput,
  primaryLocale: Locale,
): QuestionInput {
  return {
    ...question,
    primaryLocale,
    questionText: question.questionText?.trim() ?? '',
    followUpQuestions: question.followUpQuestions ?? [],
    expectedConcepts: question.expectedConcepts ?? [],
    redFlags: question.redFlags ?? [],
    sampleGoodAnswer: question.sampleGoodAnswer?.trim() ?? '',
  }
}

export function buildTranslateDraftRequestPayload(
  sourceLocale: Locale,
  targetLocale: Locale,
  question: QuestionInput,
): DraftQuestionRequest {
  const source = buildPrimaryTranslateQuestionInput(question, sourceLocale)

  return {
    mode: 'translate',
    locale: targetLocale,
    question: {
      primaryLocale: sourceLocale,
      questionText: source.questionText,
      followUpQuestions: source.followUpQuestions,
      expectedConcepts: source.expectedConcepts,
      redFlags: source.redFlags,
      sampleGoodAnswer: source.sampleGoodAnswer || undefined,
    } as QuestionDraftInput,
  }
}

export function buildGenerateDraftRequestPayload(
  locale: Locale,
  question: QuestionInput,
): DraftQuestionRequest {
  return {
    mode: 'generate',
    locale,
    question: buildQuestionDraftRequestPayload(question, locale),
  }
}
