import { useTranslations } from 'next-intl'

export function usePageGateToastMessages() {
  const t = useTranslations('toast')

  return {
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
  }
}
