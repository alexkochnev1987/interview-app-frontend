import { useTranslations } from 'next-intl'

export function useSimilarityToastMessages() {
  const t = useTranslations('toast')

  return {
    searchFailedTitle: t('similarity.searchFailedTitle'),
    noMatches: t('similarity.noMatches'),
  }
}
