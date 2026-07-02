import { useTranslations } from 'next-intl'

export function useTakeToastMessages() {
  const t = useTranslations('toast')

  return {
    submitSuccess: t('take.submitSuccess'),
    submitError: t('take.submitError'),
  }
}
