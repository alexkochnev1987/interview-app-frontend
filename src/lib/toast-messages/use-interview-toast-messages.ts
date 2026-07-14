import { useTranslations } from 'next-intl'

export function useInterviewToastMessages() {
  const t = useTranslations('toast')

  return {
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
    updateSuccess: t('interview.updateSuccess'),
    updateError: t('interview.updateError'),
    cancelSuccess: t('interview.cancelSuccess'),
    cancelError: t('interview.cancelError'),
    deleteSuccess: t('interview.deleteSuccess'),
    deleteError: t('interview.deleteError')
  }
}
