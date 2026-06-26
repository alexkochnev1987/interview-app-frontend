import { useTranslations } from 'next-intl'

export function useBulkDeleteToastMessages() {
  const t = useTranslations('toast')

  return {
    failedTitle: t('bulkDelete.failedTitle'),
    partialTitle: (deletedCount: number, scheduledCount: number) =>
      t('bulkDelete.partialTitle', { deletedCount, scheduledCount }),
    successTitle: (count: number) => t('bulkDelete.successTitle', { count }),
    successDescription: t('bulkDelete.successDescription'),
    noopTitle: t('bulkDelete.noopTitle'),
    noopDescription: t('bulkDelete.noopDescription'),
    scheduledIntro: t('bulkDelete.scheduledIntro'),
  }
}
