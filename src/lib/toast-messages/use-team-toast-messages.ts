import { useTranslations } from 'next-intl'

export function useTeamToastMessages() {
  const t = useTranslations('toast')

  return {
    updateSuccess: t('team.updateSuccess'),
    updateError: t('team.updateError'),
    updateSuccessDescription: (name: string, role: string) =>
      t('team.updateSuccessDescription', { name, role }),
  }
}
