import { useTranslations } from 'next-intl'

export function useDefaultsToastMessages() {
  const t = useTranslations('toast')

  return {
    success: t('defaults.success'),
    error: t('defaults.error'),
    info: t('defaults.info'),
    actionCompleted: t('defaults.actionCompleted'),
    actionFailed: t('defaults.actionFailed'),
  }
}
