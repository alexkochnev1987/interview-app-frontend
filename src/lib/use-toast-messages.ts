import { useTranslations } from 'next-intl'

export function useToastMessages() {
  const t = useTranslations('toast')

  return {
    defaults: {
      success: t('defaults.success'),
      error: t('defaults.error'),
      info: t('defaults.info'),
      actionCompleted: t('defaults.actionCompleted'),
      actionFailed: t('defaults.actionFailed'),
    },
    question: {
      createSuccess: t('question.createSuccess'),
      createError: t('question.createError'),
      saveSuccess: t('question.saveSuccess'),
      saveError: t('question.saveError'),
      restoreSuccess: t('question.restoreSuccess'),
      restoreError: t('question.restoreError'),
      deleteSuccess: t('question.deleteSuccess'),
      deleteError: t('question.deleteError'),
    },
    interview: {
      createSuccess: t('interview.createSuccess'),
      createError: t('interview.createError'),
      refreshLinkSuccess: t('interview.refreshLinkSuccess'),
      refreshLinkError: t('interview.refreshLinkError'),
      validationStartSuccess: t('interview.validationStartSuccess'),
      validationStartError: t('interview.validationStartError'),
      uploadSuccess: (questionNumber: number) =>
        t('interview.uploadSuccess', { questionNumber }),
      uploadError: (questionNumber: number) =>
        t('interview.uploadError', { questionNumber }),
    },
    take: {
      submitSuccess: t('take.submitSuccess'),
      submitError: t('take.submitError'),
    },
    bulkDelete: {
      failedTitle: t('bulkDelete.failedTitle'),
      partialTitle: (deletedCount: number, blockedCount: number) =>
        t('bulkDelete.partialTitle', { deletedCount, blockedCount }),
      successTitle: (count: number) => t('bulkDelete.successTitle', { count }),
      successDescription: t('bulkDelete.successDescription'),
      noopTitle: t('bulkDelete.noopTitle'),
      noopDescription: t('bulkDelete.noopDescription'),
      blockedIntro: t('bulkDelete.blockedIntro'),
    },
    questionFeed: {
      unavailableTitle: t('questionFeed.unavailableTitle'),
    },
    questionFacets: {
      unavailableTitle: t('questionFacets.unavailableTitle'),
    },
    similarity: {
      searchFailedTitle: t('similarity.searchFailedTitle'),
      noMatches: t('similarity.noMatches'),
    },
    pageGate: {
      login: {
        failedTitle: t('pageGate.login.failedTitle'),
        failedFallback: t('pageGate.login.failedFallback'),
        signingInLabel: t('pageGate.login.signingInLabel'),
        signInLabel: t('pageGate.login.signInLabel'),
      },
      interview: {
        setupBlockedTitle: t('pageGate.interview.setupBlockedTitle'),
        candidateNameRequired: t('pageGate.interview.candidateNameRequired'),
        positionRequired: t('pageGate.interview.positionRequired'),
        questionsRequired: t('pageGate.interview.questionsRequired'),
        creatingLabel: t('pageGate.interview.creatingLabel'),
      },
    },
    team: {
      updateSuccess: t('team.updateSuccess'),
      updateError: t('team.updateError'),
      updateSuccessDescription: (name: string, role: string) =>
        t('team.updateSuccessDescription', { name, role }),
    },
    rerun: {
      alreadyInProgressTitle: t('rerun.alreadyInProgressTitle'),
      startFailedTitle: t('rerun.startFailedTitle'),
      allFailedFallback: t('rerun.allFailedFallback'),
      answerFailedFallback: t('rerun.answerFailedFallback'),
      nothingToReevaluateTitle: t('rerun.nothingToReevaluateTitle'),
      nothingToReevaluateMessage: t('rerun.nothingToReevaluateMessage'),
      queuedLabel: t('rerun.queuedLabel'),
    },
    deleteQuestion: {
      cannotDeleteTitle: t('deleteQuestion.cannotDeleteTitle'),
    },
  }
}
