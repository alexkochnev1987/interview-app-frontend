import { useTranslations } from 'next-intl'

export function useQuestionToastMessages() {
  const t = useTranslations('toast')

  return {
    createSuccess: t('question.createSuccess'),
    createError: t('question.createError'),
    saveSuccess: t('question.saveSuccess'),
    saveError: t('question.saveError'),
    restoreSuccess: t('question.restoreSuccess'),
    restoreError: t('question.restoreError'),
    deleteSuccess: t('question.deleteSuccess'),
    deleteError: t('question.deleteError'),
  }
}

export function useQuestionsToastMessages() {
  const t = useTranslations('toast')

  return {
    loadFailedFallback: t('pageGate.questions.loadFailedFallback'),
  }
}

export function useQuestionFeedToastMessages() {
  const t = useTranslations('toast')

  return {
    unavailableTitle: t('questionFeed.unavailableTitle'),
  }
}

export function useQuestionFacetsToastMessages() {
  const t = useTranslations('toast')

  return {
    unavailableTitle: t('questionFacets.unavailableTitle'),
  }
}

export function useDeleteQuestionToastMessages() {
  const t = useTranslations('toast')

  return {
    cannotDeleteTitle: t('deleteQuestion.cannotDeleteTitle'),
  }
}
