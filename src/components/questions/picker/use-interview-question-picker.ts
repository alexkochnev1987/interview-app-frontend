'use client'

import { useCallback, useMemo, useState } from 'react'

import { useQuestionChipLabels } from '@/i18n/use-question-chip-labels'
import { type InterviewQuestion, type Question } from '@/lib/api'
import { buildQuestionsInfiniteParams } from '@/lib/questions-query-state'
import type { QuestionsLibraryPrefetch } from '@/lib/questions-library-prefetch'

import { buildActiveFilterChips } from './build-active-chips'
import {
  normalizeInterviewQuestionSnapshots,
} from './normalize-interview-question-snapshot'
import { pickQuestionsViewSource } from './pick-questions-view-source'
import { useQuestionFacets } from './use-question-facets'
import { useQuestionsInfinite } from './use-questions-infinite'
import { useQuestionsQuery } from './use-questions-query'

const INTERVIEW_PICKER_FETCH_OPTIONS = { eligibleForInterview: true } as const

type UseInterviewQuestionPickerOptions = {
  initialSelected?: InterviewQuestion[] | Question[]
  initialPrefetch?: QuestionsLibraryPrefetch
  serverHydrated?: boolean
}

export function useInterviewQuestionPicker({
  initialSelected = [],
  initialPrefetch,
  serverHydrated = false,
}: UseInterviewQuestionPickerOptions = {}) {
  const getChipLabel = useQuestionChipLabels()

  const [selectedById, setSelectedById] = useState(() =>
    new Map(
      normalizeInterviewQuestionSnapshots(initialSelected).map((question) => [
        question.id,
        question,
      ]),
    ),
  )

  const query = useQuestionsQuery({
    initial: initialPrefetch?.queryState,
    serverHydrated,
    syncUrl: false,
    lockStatus: 'active',
    disableFetchInCardsView: true,
    eligibleForInterview: true,
  })

  const isCardsView = query.state.view === 'cards'
  const cardsInfiniteParams = useMemo(
    () =>
      buildQuestionsInfiniteParams(
        query.state,
        query.debouncedQ,
        INTERVIEW_PICKER_FETCH_OPTIONS,
      ),
    [query.state, query.debouncedQ],
  )

  const infinite = useQuestionsInfinite({
    params: cardsInfiniteParams,
    enabled: isCardsView,
    serverHydrated,
  })

  const view = pickQuestionsViewSource(isCardsView, query, infinite)
  const facetsResult = useQuestionFacets(
    query.state,
    query.debouncedQ,
    INTERVIEW_PICKER_FETCH_OPTIONS,
  )
  const facets = facetsResult.facets

  const activeChips = buildActiveFilterChips(
    query.state,
    {
      setDifficulty: query.setDifficulty,
      setCategory: query.setCategory,
      setSubcategory: query.setSubcategory,
      setRole: query.setRole,
      setTags: query.setTags,
      setStatus: query.setStatus,
    },
    { showStatusFilter: false },
    getChipLabel,
  )

  const selectedCount = selectedById.size
  const selectedQuestions = Array.from(selectedById.values())
  const selectedIds = useMemo(
    () => new Set(selectedById.keys()),
    [selectedById],
  )

  function toggleQuestion(question: Question) {
    setSelectedById((prev) => {
      const next = new Map(prev)
      if (next.has(question.id)) {
        next.delete(question.id)
      } else {
        next.set(question.id, question)
      }
      return next
    })
  }

  function toggleQuestionsBulk(questions: Question[], select: boolean) {
    setSelectedById((prev) => {
      const next = new Map(prev)
      if (select) {
        questions.forEach((question) => next.set(question.id, question))
      } else {
        questions.forEach((question) => next.delete(question.id))
      }
      return next
    })
  }

  function removeSelected(id: string) {
    setSelectedById((prev) => {
      if (!prev.has(id)) return prev
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }

  const replaceSelected = useCallback((questions: InterviewQuestion[] | Question[]) => {
    setSelectedById(
      new Map(normalizeInterviewQuestionSnapshots(questions).map((q) => [q.id, q])),
    )
  }, [])

  return {
    query,
    infinite,
    view,
    facetsResult,
    facets,
    activeChips,
    isCardsView,
    selectedById,
    selectedCount,
    selectedQuestions,
    selectedIds,
    toggleQuestion,
    toggleQuestionsBulk,
    removeSelected,
    replaceSelected,
  }
}
