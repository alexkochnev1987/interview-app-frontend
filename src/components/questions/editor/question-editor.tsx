'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { useQuestionEditorLabels } from '@/i18n/use-question-editor-labels'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'
import { TwoColumnLayout } from '@/components/ui/layout/two-column-layout'
import { AiAgreesPill } from '@/components/questions/editor/ai-agrees-pill'
import { AiDraftPanel } from '@/components/questions/editor/ai-draft-panel'
import { AiSuggestionRow } from '@/components/questions/editor/ai-suggestion-row'
import { EditorContentSection } from '@/components/questions/editor/editor-content-section'
import { EditorTranslateLocalesPanel } from '@/components/questions/editor/editor-translate-locales-panel'
import { EditorTranslationDraftPanel } from '@/components/questions/editor/editor-translation-draft-panel'
import { QuestionEditorHeader } from '@/components/questions/editor/question-editor-header'
import { QuestionEditorSaveBar } from '@/components/questions/editor/question-editor-save-bar'
import { SimilarityPanel } from '@/components/questions/editor/similarity-panel'
import { useDirtyTracking } from '@/components/questions/editor/use-dirty-tracking'
import { useSimilaritySearch } from '@/components/questions/editor/use-similarity-search'
import {
  ApiError,
  draftQuestion,
  type QuestionGenerateDraft,
  type QuestionInput,
  type UpdateQuestionInput,
} from '@/lib/api'
import { clearFieldError, type FieldErrors } from '@/lib/clear-field-error'
import {
  validateLocaleBlocks,
  validateMetadataEnglishOnly,
  validateQuestionForm,
} from '@/lib/question-editor/validate-question-form'
import {
  isPrimaryContentComplete,
  resolveInitialEditorPhase,
  shouldUnlockPhase2AfterSave,
  type EditorPhase,
} from '@/lib/question-editor/editor-phase'
import { buildAiDraftQuestionInput } from '@/lib/question-editor/ai-draft-request'
import {
  draftToLocaleDraft,
  getPendingTranslationFields,
  getQuestionDraftFieldValue,
  getTranslatableLocales,
  type LocaleTranslationDraftEntry,
} from '@/lib/question-editor/translation-draft'
import {
  arePrimarySnapshotsEqual,
  primaryContentSnapshotFromDraft,
  primaryContentSnapshotFromQuestion,
  type PrimaryContentSnapshot,
} from '@/lib/question-editor/stale-translation'
import {
  GENERATE_DRAFT_FIELD_KEYS,
  TRANSLATE_DRAFT_FIELD_KEYS,
  type DraftFieldKey,
  type TranslateDraftFieldKey,
} from '@/lib/question-editor/field-keys'
import {
  areEqual,
  applyLocaleDraft,
  buildEditorStateForSave,
  coerceLocaleTranslation,
  editorStateToCreatePayload,
  editorStateToUpdatePayload,
  formatMetadata,
  hasLocaleDraftContent,
  type LocaleQuestionDraft,
  localeDraftFromInput,
  normalizeInitialValue,
  hasPersistedLocaleTranslation,
  localeDraftsFromTranslations,
  pickInitialEditingLocale,
  resolveEditorLocaleDraft,
} from '@/lib/question-editor/parsers'
import { FEEDBACK_POLICY } from '@/lib/feedback-policy'
import { runMutation } from '@/lib/run-mutation'
import { notifyError } from '@/lib/toast'
import { useToastMessages } from '@/lib/use-toast-messages'
import { LOCALES, type Locale } from '@/i18n/locales'

type AiStatus = 'idle' | 'loading' | 'error'
type QuestionFormField = 'questionText' | 'metadata'
type LocaleMap<T> = Partial<Record<Locale, T>>
type PrimaryDraftFieldKey = keyof LocaleQuestionDraft & DraftFieldKey

const PRIMARY_DRAFT_FIELDS: PrimaryDraftFieldKey[] = [
  'questionText',
  'followUpQuestions',
  'expectedConcepts',
  'redFlags',
  'sampleGoodAnswer',
]

interface QuestionEditorProps {
  questionId?: string
  title: string
  initialValue?: QuestionInput
  submitLabel: string
  onSubmit: (
    value: QuestionInput,
    options?: { translationsMode?: UpdateQuestionInput['translationsMode'] },
  ) => Promise<QuestionInput>
  readOnly?: boolean
  saveToastOptions?: {
    enabled?: boolean
    successMessage?: string
    errorMessage?: string
  }
}

export function QuestionEditor({
  questionId,
  title,
  initialValue,
  submitLabel,
  onSubmit,
  readOnly = false,
  saveToastOptions,
}: QuestionEditorProps) {
  const toastMessages = useToastMessages()
  const editorLabels = useQuestionEditorLabels()
  const tEditor = useTranslations('questions.editor')
  const uiLocale = useLocale() as Locale
  const normalizedInitialValue = normalizeInitialValue(initialValue)
  const initialPrimaryLocale = (
    questionId ? normalizedInitialValue.primaryLocale : uiLocale
  ) as Locale
  const initialEditingLocale = questionId
    ? pickInitialEditingLocale(uiLocale, initialPrimaryLocale, normalizedInitialValue)
    : uiLocale
  const initialLocaleDrafts = localeDraftsFromTranslations(normalizedInitialValue)
  const initialPersistedLocales = LOCALES.filter((locale) =>
    hasPersistedLocaleTranslation(normalizedInitialValue, locale),
  )
  const initialEditorPhase = resolveInitialEditorPhase({
    questionId,
    primaryLocale: initialPrimaryLocale,
    input: normalizedInitialValue,
  })
  const initialVisibleLocales =
    initialEditorPhase === 1
      ? [initialPrimaryLocale]
      : Array.from(
          new Set<Locale>([
            initialPrimaryLocale,
            initialEditingLocale,
            ...initialPersistedLocales,
          ]),
        )
  const initialAddedLocales =
    initialEditorPhase === 2
      ? initialVisibleLocales.filter((locale) => locale !== initialPrimaryLocale)
      : []
  const [value, setValue] = useState<QuestionInput>(() =>
    applyLocaleDraft(
      normalizedInitialValue,
      resolveEditorLocaleDraft(
        normalizedInitialValue,
        initialEditingLocale,
        initialPrimaryLocale,
      ),
    ),
  )
  const [activeLocale, setActiveLocale] = useState<Locale>(initialEditingLocale)
  const [primaryLocale, setPrimaryLocale] = useState<Locale>(initialPrimaryLocale)
  const [editorPhase, setEditorPhase] = useState<EditorPhase>(initialEditorPhase)
  const [addedLocales, setAddedLocales] = useState<Locale[]>(initialAddedLocales)
  const visibleLocales = useMemo(() => {
    const locales = Array.from(new Set<Locale>([primaryLocale, ...addedLocales]))
    return [primaryLocale, ...locales.filter((locale) => locale !== primaryLocale)]
  }, [primaryLocale, addedLocales])
  const [persistedLocales, setPersistedLocales] = useState<Locale[]>(
    Array.from(new Set<Locale>([initialPrimaryLocale, ...initialPersistedLocales])),
  )
  const [localeDrafts, setLocaleDrafts] = useState(initialLocaleDrafts)
  const [metadataText, setMetadataText] = useState(
    formatMetadata(initialValue?.metadata ?? {}),
  )
  const [submitting, setSubmitting] = useState(false)
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle')
  const [aiDraft, setAiDraft] = useState<QuestionGenerateDraft | null>(null)
  const [dismissedDraftFields, setDismissedDraftFields] = useState<DraftFieldKey[]>([])
  const [localeTranslationStatus, setLocaleTranslationStatus] = useState<
    LocaleMap<AiStatus>
  >({})
  const [localeTranslationErrors, setLocaleTranslationErrors] = useState<
    LocaleMap<string>
  >({})
  const [localeTranslationDrafts, setLocaleTranslationDrafts] = useState<
    LocaleMap<LocaleTranslationDraftEntry>
  >({})
  const [savedPrimarySnapshot, setSavedPrimarySnapshot] = useState<PrimaryContentSnapshot>(
    () =>
      primaryContentSnapshotFromQuestion(
        normalizedInitialValue,
        initialPrimaryLocale,
      ),
  )
  const [translateTargetLocales, setTranslateTargetLocales] = useState<Locale[]>([])
  const [isBatchTranslating, setIsBatchTranslating] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<QuestionFormField>>({})
  const [localeValidationError, setLocaleValidationError] = useState<string | null>(null)
  const [localePendingRemoval, setLocalePendingRemoval] = useState<Locale | null>(null)
  const [refreshTranslationLocales, setRefreshTranslationLocales] = useState<Locale[] | null>(
    null,
  )
  const [isRefreshingTranslations, setIsRefreshingTranslations] = useState(false)
  const [pendingTranslationsReplace, setPendingTranslationsReplace] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const fieldsDisabled = submitting || readOnly

  const { dirtyFieldKeys, isDirty, markSaved } = useDirtyTracking({
    value,
    metadataText,
    initialValue,
  })

  const similarity = useSimilaritySearch({ value, questionId })
  const skipHeaderLocaleSwitchRef = useRef(true)

  const translatableLocales = useMemo(
    () =>
      getTranslatableLocales({
        primaryLocale,
        visibleLocales,
        localeDrafts,
      }),
    [primaryLocale, visibleLocales, localeDrafts],
  )

  function formatLocaleCodes(locales: Locale[]): string {
    return locales.map((locale) => locale.toUpperCase()).join(', ')
  }

  function getNonPrimaryLocalesWithPersistedTranslation(
    question: QuestionInput,
    primaryLoc: Locale,
  ): Locale[] {
    return LOCALES.filter(
      (locale) =>
        locale !== primaryLoc && hasPersistedLocaleTranslation(question, locale),
    )
  }

  function resolveRefreshTranslationLocales(args: {
    primaryContentChanged: boolean
    editorPhase: EditorPhase
    unlockedPhase2: boolean
    persisted: QuestionInput
    primaryLoc: Locale,
  }): Locale[] | null {
    const inPhase2 = args.editorPhase === 2 || args.unlockedPhase2
    if (!questionId || !args.primaryContentChanged || !inPhase2) {
      return null
    }

    const locales = getNonPrimaryLocalesWithPersistedTranslation(
      args.persisted,
      args.primaryLoc,
    )
    return locales.length > 0 ? locales : null
  }

  async function batchTranslateLocales(targets: Locale[]): Promise<{
    translated: Array<{ locale: Locale; patch: LocaleQuestionDraft }>
    failed: Locale[]
  }> {
    const translated: Array<{ locale: Locale; patch: LocaleQuestionDraft }> = []
    const failed: Locale[] = []

    for (const locale of targets) {
      const result = await translateLocaleFromPrimary(locale, { autoApply: true })
      if (result.success && result.patch) {
        translated.push({ locale, patch: result.patch })
      } else {
        failed.push(locale)
      }
    }

    return { translated, failed }
  }

  function buildTranslateSource(): QuestionInput | null {
    const source = buildAiDraftQuestionInput({
      value: {
        ...value,
        primaryLocale,
        questionText: getPrimaryQuestionTextFromState(),
      },
      contentLocale: primaryLocale,
      localeDrafts: {
        ...localeDrafts,
        [primaryLocale]: resolveLocaleDraftByLocale(primaryLocale),
      },
    })

    if (!source.questionText?.trim()) {
      return null
    }

    return source
  }

  async function translateLocaleFromPrimary(
    locale: Locale,
    options?: { autoApply?: boolean },
  ): Promise<{ success: boolean; patch?: LocaleQuestionDraft }> {
    const source = buildTranslateSource()
    if (!source) return { success: false }

    setLocaleTranslationStatus((current) => ({ ...current, [locale]: 'loading' }))
    setLocaleTranslationErrors((current) => {
      const next = { ...current }
      delete next[locale]
      return next
    })

    try {
      const draft = await draftQuestion({
        mode: 'translate',
        question: source,
        targetLocale: locale,
      })
      if (!draft.questionText?.trim()) {
        throw new Error(editorLabels.localeTabs.translateErrorFallback)
      }
      const patch = draftToLocaleDraft(draft)
      if (options?.autoApply) {
        setLocaleTranslationDrafts((current) => {
          if (!(locale in current)) return current
          const next = { ...current }
          delete next[locale]
          return next
        })
        setLocaleTranslationStatus((current) => ({ ...current, [locale]: 'idle' }))
        return { success: true, patch }
      }
      ensureLocaleTab(locale)
      setLocaleTranslationDrafts((current) => ({
        ...current,
        [locale]: { draft, dismissedFields: [] },
      }))
      setLocaleTranslationStatus((current) => ({ ...current, [locale]: 'idle' }))
      return { success: true }
    } catch (error) {
      setLocaleTranslationStatus((current) => ({ ...current, [locale]: 'error' }))
      setLocaleTranslationErrors((current) => ({
        ...current,
        [locale]: getLocaleTranslateErrorMessage(error),
      }))
      return { success: false }
    }
  }

  function emptyLocaleDraft(): LocaleQuestionDraft {
    return {
      questionText: '',
      followUpQuestions: [],
      expectedConcepts: [],
      redFlags: [],
      sampleGoodAnswer: '',
    }
  }

  function mergeLocaleDraft(
    base: Partial<LocaleQuestionDraft> | undefined,
    patch: Partial<LocaleQuestionDraft>,
  ): LocaleQuestionDraft {
    const fallback = emptyLocaleDraft()
    return {
      questionText: patch.questionText ?? base?.questionText ?? fallback.questionText,
      followUpQuestions:
        patch.followUpQuestions ?? base?.followUpQuestions ?? fallback.followUpQuestions,
      expectedConcepts:
        patch.expectedConcepts ?? base?.expectedConcepts ?? fallback.expectedConcepts,
      redFlags: patch.redFlags ?? base?.redFlags ?? fallback.redFlags,
      sampleGoodAnswer:
        patch.sampleGoodAnswer ?? base?.sampleGoodAnswer ?? fallback.sampleGoodAnswer,
    }
  }

  function commitTranslatedLocales(
    translations: Array<{ locale: Locale; patch: LocaleQuestionDraft }>,
    activateLocale?: Locale,
  ) {
    if (translations.length === 0) return

    const currentDraft = resolveActiveLocaleDraftFromState()
    const localesToAdd = translations.map(({ locale }) => locale)

    setAddedLocales((current) =>
      Array.from(new Set([...current, ...localesToAdd])),
    )
    setLocaleDrafts((current) => {
      const next = {
        ...current,
        [activeLocale]: currentDraft,
      }
      for (const { locale, patch } of translations) {
        next[locale] = mergeLocaleDraft(current[locale], patch)
      }
      return next
    })

    if (!activateLocale) return

    const activePatch = translations.find(({ locale }) => locale === activateLocale)?.patch
    if (!activePatch) return

    setValue((current) => applyLocaleDraft(current, activePatch))
    setActiveLocale(activateLocale)
    setLocaleValidationError(null)
    setAiError(null)
  }

  async function handleBatchTranslate() {
    if (readOnly || editorPhase !== 2 || activeLocale !== primaryLocale || isBatchTranslating) {
      return
    }

    const targets = translateTargetLocales.filter((locale) => locale !== primaryLocale)
    if (targets.length === 0 || !buildTranslateSource()) return

    setIsBatchTranslating(true)
    const { translated } = await batchTranslateLocales(targets)
    setIsBatchTranslating(false)

    if (translated.length === 0) return

    const lastTranslatedLocale = translated[translated.length - 1].locale
    commitTranslatedLocales(translated, lastTranslatedLocale)
    setTranslateTargetLocales((current) =>
      current.filter((locale) => !translated.some((item) => item.locale === locale)),
    )
  }

  function getLocaleDraftForTranslation(locale: Locale): Partial<LocaleQuestionDraft> {
    if (locale === activeLocale) {
      if (locale === primaryLocale) {
        return localeDraftFromInput(value)
      }
      return {
        ...(localeDrafts[locale] ?? {}),
        questionText: value.questionText ?? '',
      }
    }
    return localeDrafts[locale] ?? resolveEditorLocaleDraft(value, locale, primaryLocale)
  }

  function getPendingTranslationFieldsForLocale(locale: Locale): TranslateDraftFieldKey[] {
    const entry = localeTranslationDrafts[locale]
    if (!entry) return []
    return getPendingTranslationFields({
      entry,
      current: getLocaleDraftForTranslation(locale),
    })
  }

  function countPendingTranslationFields(): number {
    const locales = Array.from(
      new Set<Locale>([
        ...addedLocales,
        ...(Object.keys(localeTranslationDrafts) as Locale[]),
      ]),
    )
    let count = 0
    for (const locale of locales) {
      count += getPendingTranslationFieldsForLocale(locale).length
    }
    return count
  }

  function ensureLocaleTab(locale: Locale) {
    setAddedLocales((current) =>
      current.includes(locale) ? current : [...current, locale],
    )
    setLocaleDrafts((current) => ({
      ...current,
      [locale]: current[locale] ?? {
        questionText: '',
        followUpQuestions: [],
        expectedConcepts: [],
        redFlags: [],
        sampleGoodAnswer: '',
      },
    }))
  }

  function dismissTranslationDraftField(locale: Locale, field: TranslateDraftFieldKey) {
    setLocaleTranslationDrafts((current) => {
      const entry = current[locale]
      if (!entry) return current
      const dismissedFields = entry.dismissedFields.includes(field)
        ? entry.dismissedFields
        : [...entry.dismissedFields, field]
      const nextEntry: LocaleTranslationDraftEntry = {
        ...entry,
        dismissedFields,
      }
      const pending = getPendingTranslationFields({
        entry: nextEntry,
        current: getLocaleDraftForTranslation(locale),
      })
      if (pending.length === 0) {
        const next = { ...current }
        delete next[locale]
        return next
      }
      return { ...current, [locale]: nextEntry }
    })
  }

  function applyTranslationPatchToLocale(
    locale: Locale,
    patch: Partial<LocaleQuestionDraft>,
  ) {
    setLocaleDrafts((current) => ({
      ...current,
      [locale]: {
        ...(current[locale] ?? {
          questionText: '',
          followUpQuestions: [],
          expectedConcepts: [],
          redFlags: [],
          sampleGoodAnswer: '',
        }),
        ...patch,
      },
    }))
    if (activeLocale === locale) {
      setValue((current) => ({ ...current, ...patch }))
    }
  }

  function isPrimaryDraftField(field: DraftFieldKey): field is PrimaryDraftFieldKey {
    return PRIMARY_DRAFT_FIELDS.includes(field as PrimaryDraftFieldKey)
  }

  function getPrimaryQuestionTextFromState(): string {
    if (activeLocale === primaryLocale) {
      return value.questionText ?? ''
    }
    return localeDrafts[primaryLocale]?.questionText ?? ''
  }

  function setPrimaryDraftField(
    patch: Partial<LocaleQuestionDraft>,
    field: PrimaryDraftFieldKey,
    value: QuestionInput[DraftFieldKey],
  ) {
    switch (field) {
      case 'questionText':
        patch.questionText = typeof value === 'string' ? value : ''
        return
      case 'followUpQuestions':
        patch.followUpQuestions = Array.isArray(value) ? (value as string[]) : []
        return
      case 'expectedConcepts':
        patch.expectedConcepts = Array.isArray(value)
          ? (value as LocaleQuestionDraft['expectedConcepts'])
          : []
        return
      case 'redFlags':
        patch.redFlags = Array.isArray(value)
          ? (value as LocaleQuestionDraft['redFlags'])
          : []
        return
      case 'sampleGoodAnswer':
        patch.sampleGoodAnswer = typeof value === 'string' ? value : ''
        return
    }
  }

  function resolvePrimaryDraft(): LocaleQuestionDraft {
    const activePrimaryDraft =
      activeLocale === primaryLocale
        ? localeDraftFromInput(value)
        : {
            questionText: '',
            followUpQuestions: [],
            expectedConcepts: [],
            redFlags: [],
            sampleGoodAnswer: '',
          }
    const storedPrimaryDraft = localeDrafts[primaryLocale] ?? {}

    return {
      questionText: getPrimaryQuestionTextFromState(),
      followUpQuestions:
        storedPrimaryDraft.followUpQuestions ?? activePrimaryDraft.followUpQuestions,
      expectedConcepts:
        storedPrimaryDraft.expectedConcepts ?? activePrimaryDraft.expectedConcepts,
      redFlags: storedPrimaryDraft.redFlags ?? activePrimaryDraft.redFlags,
      sampleGoodAnswer:
        storedPrimaryDraft.sampleGoodAnswer ?? activePrimaryDraft.sampleGoodAnswer,
    }
  }

  function resolveActiveLocaleDraftFromState(): LocaleQuestionDraft {
    return localeDraftFromInput(value)
  }

  function getLocaleContentDraft(locale: Locale): LocaleQuestionDraft {
    if (locale === activeLocale) {
      return localeDraftFromInput(value)
    }
    const stored = localeDrafts[locale]
    if (stored) {
      return {
        questionText: stored.questionText ?? '',
        followUpQuestions: stored.followUpQuestions ?? [],
        expectedConcepts: stored.expectedConcepts ?? [],
        redFlags: stored.redFlags ?? [],
        sampleGoodAnswer: stored.sampleGoodAnswer ?? '',
      }
    }
    return resolveEditorLocaleDraft(value, locale, primaryLocale)
  }

  function updateLocaleContentDraft(
    locale: Locale,
    patch: Partial<LocaleQuestionDraft>,
  ) {
    if (readOnly) return
    if ('questionText' in patch) {
      clearFieldError('questionText', setFieldErrors)
    }
    setLocaleValidationError(null)

    if (locale === primaryLocale) {
      applyPatchToPrimaryDraft(patch)
      for (const field of GENERATE_DRAFT_FIELD_KEYS) {
        if (field in patch) {
          dismissDraftField(field)
        }
      }
      return
    }

    applyTranslationPatchToLocale(locale, patch)
    for (const field of TRANSLATE_DRAFT_FIELD_KEYS) {
      if (field in patch) {
        dismissTranslationDraftField(locale, field)
      }
    }
  }

  function applyPatchToPrimaryDraft(patch: Partial<LocaleQuestionDraft>) {
    setLocaleDrafts((current) => {
      const currentPrimaryDraft =
        current[primaryLocale] ?? {
          questionText: '',
          followUpQuestions: [],
          expectedConcepts: [],
          redFlags: [],
          sampleGoodAnswer: '',
        }
      return {
        ...current,
        [primaryLocale]: {
          ...currentPrimaryDraft,
          ...patch,
        },
      }
    })
    if (activeLocale === primaryLocale) {
      setValue((current) => ({ ...current, ...patch }))
    }
  }


  function getAiCurrentFieldValue(field: DraftFieldKey): QuestionInput[DraftFieldKey] {
    if (isPrimaryDraftField(field)) {
      const primaryDraft = resolvePrimaryDraft()
      return primaryDraft[field] as QuestionInput[DraftFieldKey]
    }
    return value[field]
  }

  function handlePrimaryLocaleChange(_nextLocale: Locale) {
    // Primary locale is fixed at creation and cannot be changed.
  }

  function switchLocale(nextLocale: Locale) {
    if (!visibleLocales.includes(nextLocale)) {
      setLocaleValidationError(
        editorLabels.validation.localeNotAdded({
          locale: editorLabels.localeTabs.localeLabel(nextLocale),
        }),
      )
      return
    }
    if (nextLocale === activeLocale) return
    const currentDraft = resolveActiveLocaleDraftFromState()
    const nextDraft =
      localeDrafts[nextLocale] ??
      resolveEditorLocaleDraft(value, nextLocale, primaryLocale)
    setLocaleDrafts((current) => ({
      ...current,
      [activeLocale]: currentDraft,
    }))
    setValue((current) => applyLocaleDraft(current, nextDraft))
    setActiveLocale(nextLocale)
    setLocaleValidationError(null)
    setAiError(null)
  }

  function requestRemoveLocale(locale: Locale) {
    if (readOnly || editorPhase !== 2) return
    if (locale === primaryLocale) {
      setLocaleValidationError(editorLabels.validation.primaryLocaleCannotBeRemoved)
      return
    }
    if (!visibleLocales.includes(locale)) {
      setLocaleValidationError(
        editorLabels.validation.localeNotAdded({
          locale: editorLabels.localeTabs.localeLabel(locale),
        }),
      )
      return
    }
    setLocalePendingRemoval(locale)
  }

  function performRemoveLocale(locale: Locale) {
    const currentDraft = resolveActiveLocaleDraftFromState()
    const fallbackLocale = activeLocale === locale ? primaryLocale : activeLocale
    const fallbackDraft =
      fallbackLocale === activeLocale
        ? currentDraft
        : localeDrafts[fallbackLocale] ??
          resolveEditorLocaleDraft(value, fallbackLocale, primaryLocale)

    setLocaleDrafts((current) => {
      const next = {
        ...current,
        [activeLocale]: currentDraft,
      }
      delete next[locale]
      return next
    })
    setAddedLocales((current) => current.filter((item) => item !== locale))
    setValue((current) => {
      const nextTranslations = { ...(current.translations ?? {}) }
      delete nextTranslations[locale]
      return applyLocaleDraft(
        {
          ...current,
          translations: nextTranslations,
        },
        fallbackDraft,
      )
    })
    if (activeLocale === locale) {
      setActiveLocale(fallbackLocale)
    }
    setLocaleValidationError(null)
    setAiError(null)
    setAiDraft(null)
    setDismissedDraftFields([])
    setLocaleTranslationStatus((current) => {
      if (!(locale in current)) return current
      const next = { ...current }
      delete next[locale]
      return next
    })
    setLocaleTranslationErrors((current) => {
      if (!(locale in current)) return current
      const next = { ...current }
      delete next[locale]
      return next
    })
    setLocaleTranslationDrafts((current) => {
      if (!(locale in current)) return current
      const next = { ...current }
      delete next[locale]
      return next
    })
    setTranslateTargetLocales((current) => current.filter((item) => item !== locale))
  }

  function confirmRemoveLocale() {
    if (!localePendingRemoval) return
    performRemoveLocale(localePendingRemoval)
    setPendingTranslationsReplace(true)
    setLocalePendingRemoval(null)
  }

  useEffect(() => {
    if (skipHeaderLocaleSwitchRef.current) {
      skipHeaderLocaleSwitchRef.current = false
      return
    }
    if (!visibleLocales.includes(uiLocale)) {
      return
    }
    if (questionId && !hasPersistedLocaleTranslation(value, uiLocale)) {
      return
    }
    const timeoutId = window.setTimeout(() => {
      switchLocale(uiLocale)
    }, 0)
    return () => {
      window.clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to header locale changes
  }, [uiLocale])

  function dismissDraftField(field: DraftFieldKey) {
    setDismissedDraftFields((current) =>
      current.includes(field) ? current : [...current, field],
    )
  }

  function resolveLocaleDraftByLocale(locale: Locale): LocaleQuestionDraft {
    if (locale === activeLocale) {
      return localeDraftFromInput(value)
    }
    const fallbackDraft = resolveEditorLocaleDraft(value, locale, primaryLocale)
    const draft = localeDrafts[locale]
    if (!draft) {
      return fallbackDraft
    }
    return {
      questionText: draft.questionText ?? fallbackDraft.questionText,
      followUpQuestions: draft.followUpQuestions ?? fallbackDraft.followUpQuestions,
      expectedConcepts: draft.expectedConcepts ?? fallbackDraft.expectedConcepts,
      redFlags: draft.redFlags ?? fallbackDraft.redFlags,
      sampleGoodAnswer: draft.sampleGoodAnswer ?? fallbackDraft.sampleGoodAnswer,
    }
  }

  function getLocaleQuestionText(locale: Locale): string {
    return getLocaleContentDraft(locale).questionText
  }

  function toggleTranslateTarget(locale: Locale, checked: boolean) {
    setTranslateTargetLocales((current) =>
      checked ? Array.from(new Set([...current, locale])) : current.filter((item) => item !== locale),
    )
  }

  function applyTranslationField(locale: Locale, field: TranslateDraftFieldKey) {
    const entry = localeTranslationDrafts[locale]
    if (!entry) return
    const nextValue = getQuestionDraftFieldValue(entry.draft, field)
    if (nextValue === undefined) return

    const patch: Partial<LocaleQuestionDraft> = {}
    if (isPrimaryDraftField(field)) {
      setPrimaryDraftField(patch, field, nextValue as QuestionInput[DraftFieldKey])
    }
    const updatedCurrent = {
      ...getLocaleDraftForTranslation(locale),
      ...patch,
    }
    applyTranslationPatchToLocale(locale, patch)
    const dismissedFields = entry.dismissedFields.includes(field)
      ? entry.dismissedFields
      : [...entry.dismissedFields, field]
    const pending = getPendingTranslationFields({
      entry: { ...entry, dismissedFields },
      current: updatedCurrent,
    })
    setLocaleTranslationDrafts((current) => {
      const existing = current[locale]
      if (!existing) return current
      if (pending.length === 0) {
        const next = { ...current }
        delete next[locale]
        return next
      }
      return {
        ...current,
        [locale]: {
          ...existing,
          dismissedFields,
        },
      }
    })
  }

  function applyAllTranslationFields(locale: Locale) {
    const entry = localeTranslationDrafts[locale]
    if (!entry) return
    const patch = draftToLocaleDraft(entry.draft)
    applyTranslationPatchToLocale(locale, patch)
    setLocaleTranslationDrafts((current) => {
      if (!(locale in current)) return current
      const next = { ...current }
      delete next[locale]
      return next
    })
    setLocaleTranslationErrors((current) => {
      if (!(locale in current)) return current
      const next = { ...current }
      delete next[locale]
      return next
    })
  }

  function renderTranslationSuggestion(locale: Locale, field: TranslateDraftFieldKey) {
    if (readOnly) return null
    const entry = localeTranslationDrafts[locale]
    if (!entry) return null

    if (!getPendingTranslationFieldsForLocale(locale).includes(field)) {
      const draftValue = getQuestionDraftFieldValue(entry.draft, field)
      const currentValue = getLocaleDraftForTranslation(locale)[field]
      if (draftValue !== undefined && areEqual(currentValue, draftValue)) {
        return <AiAgreesPill />
      }
      return null
    }

    return (
      <AiSuggestionRow
        value={getQuestionDraftFieldValue(entry.draft, field)}
        onApply={() => applyTranslationField(locale, field)}
        onKeep={() => dismissTranslationDraftField(locale, field)}
      />
    )
  }

  function renderTranslationTabPanel(locale: Locale) {
    return (
      <EditorTranslationDraftPanel
        localeLabel={editorLabels.localeTabs.localeLabel(locale)}
        pendingCount={getPendingTranslationFieldsForLocale(locale).length}
        loading={localeTranslationStatus[locale] === 'loading'}
        error={localeTranslationErrors[locale]}
        disabled={fieldsDisabled}
        onApplyAll={() => applyAllTranslationFields(locale)}
        renderFieldSuggestion={(field) => renderTranslationSuggestion(locale, field)}
      />
    )
  }

  function getLocaleTranslateErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
      const normalizedMessage = error.message.toLowerCase()
      if (
        normalizedMessage.includes('primarylocale') ||
        normalizedMessage.includes('primary locale')
      ) {
        return editorLabels.validation.primaryLocaleRequired
      }
    }
    return editorLabels.localeTabs.translateErrorFallback
  }

  function update(patch: Partial<QuestionInput>) {
    if (readOnly) return
    if ('questionText' in patch) {
      clearFieldError('questionText', setFieldErrors)
    }
    setLocaleValidationError(null)
    setValue((current) => ({ ...current, ...patch }))
    for (const field of GENERATE_DRAFT_FIELD_KEYS) {
      if (field in patch) {
        dismissDraftField(field)
      }
    }
  }

  function handleMetadataTextChange(next: string) {
    clearFieldError('metadata', setFieldErrors)
    setLocaleValidationError(null)
    setMetadataText(next)
  }

  async function handleGenerate() {
    if (readOnly || activeLocale !== primaryLocale) return
    const primaryQuestionText = getLocaleQuestionText(primaryLocale).trim()
    if (!primaryQuestionText) {
      setAiError(null)
      setFieldErrors((prev) => ({
        ...prev,
        questionText: editorLabels.validation.questionTextRequiredForAi,
      }))
      return
    }

    clearFieldError('questionText', setFieldErrors)
    setAiError(null)
    setAiStatus('loading')

    try {
      const aiQuestion = buildAiDraftQuestionInput({
        value: {
          ...value,
          primaryLocale,
          questionText: primaryQuestionText,
        },
        contentLocale: primaryLocale,
        localeDrafts: {
          ...localeDrafts,
          [primaryLocale]: resolveLocaleDraftByLocale(primaryLocale),
        },
      })
      const draft = await draftQuestion({
        mode: 'generate',
        question: aiQuestion,
        targetLocale: primaryLocale,
      })
      setAiDraft(draft as QuestionGenerateDraft)
      setDismissedDraftFields([])
      setAiStatus('idle')
    } catch (err) {
      setAiDraft(null)
      setAiStatus('error')
      setAiError(
        err instanceof Error
          ? err.message
          : FEEDBACK_POLICY.draftQuestion.inlineErrorFallback,
      )
    }
  }

  function getAiDraftFieldValue(field: DraftFieldKey): QuestionInput[DraftFieldKey] | undefined {
    if (!aiDraft) return undefined
    switch (field) {
      case 'questionText':
        return aiDraft.questionText
      case 'followUpQuestions':
        return aiDraft.followUpQuestions
      case 'expectedConcepts':
        return aiDraft.expectedConcepts
      case 'redFlags':
        return aiDraft.redFlags
      case 'sampleGoodAnswer':
        return aiDraft.sampleGoodAnswer
      case 'externalId':
        return aiDraft.externalId
      case 'role':
        return aiDraft.role
      case 'focus':
        return aiDraft.focus
      case 'category':
        return aiDraft.category
      case 'subcategory':
        return aiDraft.subcategory
      case 'difficulty':
        return aiDraft.difficulty
      case 'weight':
        return aiDraft.weight
      case 'minimumPassScore':
        return aiDraft.minimumPassScore
      case 'tags':
        return aiDraft.tags
      default:
        return undefined
    }
  }

  function applyAllAiFields() {
    if (!aiDraft || pendingDraftFields.length === 0 || readOnly) return
    const basePatch: Partial<QuestionInput> = {}
    const primaryPatch: Partial<LocaleQuestionDraft> = {}
    for (const { key } of pendingDraftFields) {
      const nextValue = getAiDraftFieldValue(key)
      if (isPrimaryDraftField(key)) {
        setPrimaryDraftField(primaryPatch, key, nextValue)
      } else {
        ;(basePatch as Record<string, unknown>)[key] = nextValue
      }
    }
    if (Object.keys(basePatch).length > 0) {
      setValue((current) => ({ ...current, ...basePatch }))
    }
    if (Object.keys(primaryPatch).length > 0) {
      applyPatchToPrimaryDraft(primaryPatch)
    }
    setAiDraft(null)
    setAiError(null)
    setDismissedDraftFields([])
  }

  function applyDraftField(field: DraftFieldKey) {
    if (!aiDraft || readOnly) return
    const nextValue = getAiDraftFieldValue(field)
    if (isPrimaryDraftField(field)) {
      applyPatchToPrimaryDraft({ [field]: nextValue } as Partial<LocaleQuestionDraft>)
      dismissDraftField(field)
      return
    }
    update({ [field]: nextValue } as Partial<QuestionInput>)
  }

  function keepCurrentField(field: DraftFieldKey) {
    dismissDraftField(field)
  }

  const pendingDraftFields = !aiDraft
    ? []
    : editorLabels.generateDraftFields.filter(
        ({ key }) =>
          !dismissedDraftFields.includes(key) &&
          getAiDraftFieldValue(key) !== undefined &&
          !areEqual(getAiCurrentFieldValue(key), getAiDraftFieldValue(key)),
      )

  function renderAiSuggestion(field: DraftFieldKey) {
    if (readOnly || !aiDraft || activeLocale !== primaryLocale) return null
    if (pendingDraftFields.some((item) => item.key === field)) {
      return (
        <AiSuggestionRow
          value={getAiDraftFieldValue(field)}
          onApply={() => applyDraftField(field)}
          onKeep={() => keepCurrentField(field)}
        />
      )
    }
    if (areEqual(getAiCurrentFieldValue(field), getAiDraftFieldValue(field))) {
      return <AiAgreesPill />
    }
    return null
  }

  async function persistEditorPayload(
    payload: QuestionInput,
    translationsMode?: UpdateQuestionInput['translationsMode'],
    options?: { showSuccessToast?: boolean },
  ): Promise<QuestionInput | null> {
    setSubmitting(true)
    try {
      const persisted = normalizeInitialValue(
        await runMutation(() => onSubmit(payload, { translationsMode }), {
          showSuccessToast: options?.showSuccessToast ?? (saveToastOptions?.enabled ?? true),
          successMessage: saveToastOptions?.successMessage ?? toastMessages.question.saveSuccess,
          errorMessage: saveToastOptions?.errorMessage ?? toastMessages.question.saveError,
          getErrorMessage: (error) =>
            toastMessages.apiError.message(error) ??
            saveToastOptions?.errorMessage ??
            toastMessages.question.saveError,
        }),
      )
      applyPersistedQuestionState(persisted)
      return persisted
    } catch {
      return null
    } finally {
      setSubmitting(false)
    }
  }

  function applyPersistedQuestionState(persisted: QuestionInput) {
    const normalizedMetadataText = formatMetadata(persisted.metadata ?? {})
    const nextPrimaryLocale = (persisted.primaryLocale ?? primaryLocale) as Locale
    const nextPersistedLocales = Array.from(
      new Set<Locale>([
        nextPrimaryLocale,
        ...LOCALES.filter((locale) => hasPersistedLocaleTranslation(persisted, locale)),
      ]),
    )
    const nextAddedLocales = nextPersistedLocales.filter(
      (locale) => locale !== nextPrimaryLocale,
    )
    const nextActiveLocale = [nextPrimaryLocale, ...nextAddedLocales].includes(activeLocale)
      ? activeLocale
      : nextPrimaryLocale
    setValue(
      applyLocaleDraft(
        persisted,
        coerceLocaleTranslation(persisted.translations?.[nextActiveLocale]),
      ),
    )
    setLocaleDrafts(localeDraftsFromTranslations(persisted))
    setPrimaryLocale(nextPrimaryLocale)
    setPersistedLocales(nextPersistedLocales)
    setAddedLocales(nextAddedLocales)
    setActiveLocale(nextActiveLocale)
    setMetadataText(normalizedMetadataText)
    setPendingTranslationsReplace(false)
    if (editorPhase === 1 && shouldUnlockPhase2AfterSave(persisted, nextPrimaryLocale)) {
      setEditorPhase(2)
    }
    markSaved(persisted, normalizedMetadataText)
    setSavedPrimarySnapshot(
      primaryContentSnapshotFromQuestion(persisted, nextPrimaryLocale),
    )
    setAiDraft(null)
    setAiError(null)
    setDismissedDraftFields([])
  }

  async function confirmRefreshTranslations() {
    if (!refreshTranslationLocales?.length || !questionId) return

    setIsRefreshingTranslations(true)
    try {
      const { translated, failed } = await batchTranslateLocales(refreshTranslationLocales)

      if (failed.length > 0) {
        notifyError(editorLabels.localeTabs.translateErrorFallback, {
          description: formatLocaleCodes(failed),
        })
      }

      if (translated.length === 0) {
        return
      }

      commitTranslatedLocales(translated)

      const currentDraft = resolveActiveLocaleDraftFromState()
      const primaryDraftForSave = resolvePrimaryDraft()
      const updatedDrafts = {
        ...localeDrafts,
        [activeLocale]: currentDraft,
        [primaryLocale]: {
          ...primaryDraftForSave,
          questionText: getLocaleQuestionText(primaryLocale),
        },
      }
      for (const { locale, patch } of translated) {
        updatedDrafts[locale] = mergeLocaleDraft(updatedDrafts[locale], patch)
      }

      const editorState = buildEditorStateForSave({
        primaryLocale,
        value,
        visibleLocales,
        localeDrafts: updatedDrafts,
        addedLocales,
      })
      const followUpPayload = editorStateToUpdatePayload(editorState) as QuestionInput
      const persisted = await persistEditorPayload(followUpPayload, undefined, {
        showSuccessToast: false,
      })
      if (persisted) {
        setRefreshTranslationLocales(null)
      }
    } finally {
      setIsRefreshingTranslations(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (readOnly) return

    if (pendingDraftFields.length > 0) {
      setLocaleValidationError(editorLabels.validation.pendingAiDraft)
      return
    }

    if (countPendingTranslationFields() > 0) {
      setLocaleValidationError(editorLabels.validation.pendingTranslationDraft)
      return
    }

    const { errors, metadata } = validateQuestionForm(
      {
        questionText: getLocaleQuestionText(primaryLocale),
        metadataText,
      },
      editorLabels.validation,
    )

    if (Object.keys(errors).length > 0) {
      setLocaleValidationError(null)
      setFieldErrors(errors)
      return
    }

    const contentLocale = activeLocale
    const currentDraft = resolveActiveLocaleDraftFromState()
    const primaryDraftForSave = resolvePrimaryDraft()
    const draftsForSave = {
      ...localeDrafts,
      [contentLocale]: currentDraft,
      [primaryLocale]: {
        ...primaryDraftForSave,
        questionText: getLocaleQuestionText(primaryLocale),
      },
    }

    const localeError = validateLocaleBlocks({
      primaryLocale,
      activeLocale: contentLocale,
      activeDraft: currentDraft,
      requiredLocales: editorPhase === 1 ? [primaryLocale] : visibleLocales,
      localeDrafts: draftsForSave,
      messages: editorLabels.validation,
      fieldLabel: editorLabels.fieldLabel,
    })
    if (localeError) {
      setLocaleValidationError(localeError)
      return
    }

    if (!metadata) {
      return
    }

    const metadataEnglishError = validateMetadataEnglishOnly(
      { ...value, metadata },
      editorLabels.validation,
    )
    if (metadataEnglishError) {
      setLocaleValidationError(metadataEnglishError)
      return
    }

    const editorState = buildEditorStateForSave({
      primaryLocale,
      value: { ...value, metadata },
      visibleLocales: editorPhase === 1 ? [primaryLocale] : visibleLocales,
      localeDrafts: draftsForSave,
      addedLocales:
        editorPhase === 1 ? [] : addedLocales,
    })
    const removedPersistedLocale = persistedLocales.some(
      (locale) => !visibleLocales.includes(locale),
    )
    const translationsMode =
      removedPersistedLocale || pendingTranslationsReplace ? 'replace' : undefined
    const payload: QuestionInput = questionId
      ? (editorStateToUpdatePayload(editorState, { translationsMode }) as QuestionInput)
      : (editorStateToCreatePayload(editorState) as QuestionInput)
    const primaryContentChanged = !arePrimarySnapshotsEqual(
      savedPrimarySnapshot,
      primaryContentSnapshotFromDraft(primaryDraftForSave),
    )

    setFieldErrors({})
    setLocaleValidationError(null)

    const persisted = await persistEditorPayload(payload, translationsMode)
    if (!persisted) {
      return
    }

    const nextPrimaryLocale = (persisted.primaryLocale ?? primaryLocale) as Locale
    const unlockedPhase2 =
      editorPhase === 1 && shouldUnlockPhase2AfterSave(persisted, nextPrimaryLocale)
    const refreshLocales = resolveRefreshTranslationLocales({
      primaryContentChanged,
      editorPhase,
      unlockedPhase2,
      persisted,
      primaryLoc: nextPrimaryLocale,
    })
    if (refreshLocales) {
      setRefreshTranslationLocales(refreshLocales)
    }
  }

  const primaryContentComplete = isPrimaryContentComplete(resolvePrimaryDraft())
  const hasPendingAiDraft = pendingDraftFields.length > 0
  const hasPendingTranslationDraft = countPendingTranslationFields() > 0
  const canSubmit =
    primaryContentComplete &&
    !hasPendingAiDraft &&
    !hasPendingTranslationDraft &&
    !submitting &&
    (!questionId || isDirty)

  return (
    <PageShell spacing="tight">
      <QuestionEditorHeader
        title={title}
        difficulty={value.difficulty}
        weight={value.weight || 1}
        pendingDraftCount={readOnly ? 0 : pendingDraftFields.length}
      />

      <TwoColumnLayout
        main={(
          <form onSubmit={handleSubmit}>
            <Stack gap={6}>
              {localeValidationError ? (
                <Alert variant="danger">
                  <AlertTitle>{editorLabels.validation.primaryLocaleRequired}</AlertTitle>
                  <AlertDescription>{localeValidationError}</AlertDescription>
                </Alert>
              ) : null}
              <EditorContentSection
                editorPhase={editorPhase}
                locales={visibleLocales}
                activeLocale={activeLocale}
                primaryLocale={primaryLocale}
                localeLabel={editorLabels.localeTabs.localeLabel}
                removeLanguageLabel={editorLabels.localeTabs.removeLanguage}
                tabsAriaLabel={editorLabels.localeTabs.tabsAriaLabel}
                onSelectLocale={switchLocale}
                onRemoveLocale={requestRemoveLocale}
                value={value}
                metadataText={metadataText}
                submitting={fieldsDisabled}
                primaryLocaleDisabled
                onPrimaryLocaleChange={handlePrimaryLocaleChange}
                onMetadataUpdate={update}
                onMetadataTextChange={
                  readOnly ? () => {} : handleMetadataTextChange
                }
                metadataError={fieldErrors.metadata}
                getLocaleContentDraft={getLocaleContentDraft}
                onLocaleContentUpdate={updateLocaleContentDraft}
                renderAiSuggestion={renderAiSuggestion}
                renderTranslationTabPanel={renderTranslationTabPanel}
                questionTextError={fieldErrors.questionText}
                translateLocalesPanel={
                  !readOnly && editorPhase === 2 && activeLocale === primaryLocale ? (
                    <EditorTranslateLocalesPanel
                      availableLocales={translatableLocales}
                      selectedLocales={translateTargetLocales}
                      localeLabel={editorLabels.localeTabs.localeLabel}
                      disabled={fieldsDisabled}
                      translateDisabled={
                        !getPrimaryQuestionTextFromState().trim() || isBatchTranslating
                      }
                      isBatchTranslating={isBatchTranslating}
                      getLocaleStatus={(locale) => localeTranslationStatus[locale]}
                      getLocaleError={(locale) => localeTranslationErrors[locale]}
                      onToggleLocale={toggleTranslateTarget}
                      onTranslate={handleBatchTranslate}
                    />
                  ) : null
                }
              />
              {!readOnly ? (
                <QuestionEditorSaveBar
                  isDirty={isDirty}
                  dirtyFieldLabels={dirtyFieldKeys.map((key) =>
                    editorLabels.fieldLabel(key),
                  )}
                  submitting={submitting}
                  submitLabel={submitLabel}
                  canSubmit={canSubmit}
                />
              ) : null}
            </Stack>
          </form>
        )}
        aside={(
          <>
            {!readOnly && activeLocale === primaryLocale ? (
              <AiDraftPanel
                hasPendingDraft={Boolean(aiDraft) && pendingDraftFields.length > 0}
                pendingCount={pendingDraftFields.length}
                loading={aiStatus === 'loading'}
                disabled={fieldsDisabled}
                error={aiError ?? undefined}
                onGenerate={handleGenerate}
                onApplyAll={applyAllAiFields}
              />
            ) : null}
            <SimilarityPanel
              status={similarity.status}
              matches={similarity.matches}
              error={similarity.error}
              signalSummary={similarity.signalSummary}
              canSearch={similarity.canSearch}
              resultsStale={similarity.resultsStale}
              isEditMode={Boolean(questionId)}
              disabled={fieldsDisabled}
              onRunSearch={similarity.runManualSearch}
            />
          </>
        )}
      />
      {!readOnly ? (
        <>
          <ConfirmDialog
            open={localePendingRemoval !== null}
            destructive
            title={
              localePendingRemoval
                ? tEditor('removeLocaleConfirmTitle', {
                    locale: editorLabels.localeTabs.localeLabel(localePendingRemoval),
                  })
                : ''
            }
            description={tEditor('removeLocaleConfirmDescription')}
            confirmLabel={tEditor('removeLocaleConfirmLabel')}
            cancelLabel={tEditor('removeLocaleCancelLabel')}
            onConfirm={confirmRemoveLocale}
            onCancel={() => setLocalePendingRemoval(null)}
          />
          <ConfirmDialog
            open={refreshTranslationLocales !== null}
            title={tEditor('refreshTranslationsTitle')}
            description={
              refreshTranslationLocales
                ? tEditor('refreshTranslationsDescription', {
                    locales: formatLocaleCodes(refreshTranslationLocales),
                  })
                : undefined
            }
            confirmLabel={tEditor('refreshTranslationsConfirm')}
            cancelLabel={tEditor('refreshTranslationsCancel')}
            loading={isRefreshingTranslations}
            onConfirm={() => void confirmRefreshTranslations()}
            onCancel={() => setRefreshTranslationLocales(null)}
          />
        </>
      ) : null}
    </PageShell>
  )
}
