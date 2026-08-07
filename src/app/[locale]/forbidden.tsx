import { getLocale, getTranslations } from 'next-intl/server'

import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'

export default async function Forbidden() {
  const currentLocale = await getLocale()
  const t = await getTranslations({ locale: currentLocale, namespace: 'common' })

  return (
    <ForbiddenAccessPage
      title={t('forbiddenTitle', { defaultValue: 'Forbidden' })}
      description={t('forbiddenDescription', {
        defaultValue: 'You do not have permission to access this resource.',
      })}
    />
  )
}
