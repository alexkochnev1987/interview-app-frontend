import { useTranslations } from 'next-intl'

export function useTemplateToastMessages() {
  const t = useTranslations('toast')

  return {
    createSuccess: t('template.createSuccess'),
    createError: t('template.createError'),
    updateSuccess: t('template.updateSuccess'),
    updateError: t('template.updateError'),
    deleteSuccess: t('template.deleteSuccess'),
    deleteError: t('template.deleteError'),
  }
}
