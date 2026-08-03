import { useTranslations } from 'next-intl'

export function useAvatarToastMessages() {
  const t = useTranslations('toast')

  return {
    uploadSuccess: t('avatar.uploadSuccess'),
    uploadError: t('avatar.uploadError'),
    removeSuccess: t('avatar.removeSuccess'),
    removeError: t('avatar.removeError'),
    restoreSuccess: t('avatar.restoreSuccess'),
    restoreError: t('avatar.restoreError'),
  }
}
