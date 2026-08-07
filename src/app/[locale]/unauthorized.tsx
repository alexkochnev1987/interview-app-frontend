import { getLocale, getTranslations } from 'next-intl/server'

import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'

export default async function Unauthorized() {
  const currentLocale = await getLocale()
  const t = await getTranslations({ locale: currentLocale, namespace: 'common' })

  return (
    <ForbiddenAccessPage
      title={t('unauthorizedTitle', { defaultValue: 'Unauthorized' })}
      description={t('unauthorizedDescription', {
        defaultValue: 'Please log in to access this page.',
      })}
    />
  )
}
