import { useTranslations } from 'next-intl'

export function useRerunToastMessages() {
  const t = useTranslations('toast')

  return {
    alreadyInProgressTitle: t('rerun.alreadyInProgressTitle'),
    startFailedTitle: t('rerun.startFailedTitle'),
    allFailedFallback: t('rerun.allFailedFallback'),
    answerFailedFallback: t('rerun.answerFailedFallback'),
    nothingToReevaluateTitle: t('rerun.nothingToReevaluateTitle'),
    nothingToReevaluateMessage: t('rerun.nothingToReevaluateMessage'),
    queuedLabel: t('rerun.queuedLabel'),
  }
}
