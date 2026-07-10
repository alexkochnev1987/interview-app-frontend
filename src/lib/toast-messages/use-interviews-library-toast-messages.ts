import { useTranslations } from 'next-intl'

export function useInterviewsLibraryToastMessages() {
  const t = useTranslations('toast')

  return {
    loadFailedFallback: t('interviewsLibrary.loadFailedFallback'),
  }
}
