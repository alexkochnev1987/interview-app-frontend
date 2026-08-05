import { useTranslations } from 'next-intl'

export function useTeamToastMessages() {
  const t = useTranslations('toast')

  return {
    updateSuccess: t('team.updateSuccess'),
    updateError: t('team.updateError'),
    updateSuccessDescription: (name: string, role: string) =>
      t('team.updateSuccessDescription', { name, role }),
    editAccountSuccess: t('team.editAccountSuccess'),
    editAccountError: t('team.editAccountError'),
    editAccountSuccessDescription: (name: string) =>
      t('team.editAccountSuccessDescription', { name }),
    deleteSuccess: t('team.deleteSuccess'),
    deleteError: t('team.deleteError'),
    deleteSuccessDescription: (name: string) => t('team.deleteSuccessDescription', { name }),
  }
}
