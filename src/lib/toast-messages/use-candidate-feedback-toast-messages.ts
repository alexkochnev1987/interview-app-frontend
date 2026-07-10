import { useTranslations } from 'next-intl'

export function useCandidateFeedbackToastMessages() {
  const t = useTranslations('toast.candidateFeedback')

  return {
    acceptSuccess: t('acceptSuccess'),
    acceptError: t('acceptError'),
    saveSuccess: t('saveSuccess'),
    saveError: t('saveError'),
    generateStartSuccess: t('generateStartSuccess'),
    generateStartError: t('generateStartError'),
  }
}
