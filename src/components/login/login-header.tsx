'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { BrandMark } from '@/components/ui/brand-mark'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { Inline } from '@/components/ui/layout/inline'
import { LOCALES, type Locale } from '@/i18n/locales'
import { usePathname } from '@/i18n/navigation'

export function LoginHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale() as Locale
  const tLanguage = useTranslations('languageSwitcher')

  const queryString = searchParams.toString()
  const languageHref = queryString ? `${pathname}?${queryString}` : pathname
  const languageOptions = LOCALES.map((optionLocale) => ({
    locale: optionLocale,
    label: tLanguage(`locales.${optionLocale}`),
  }))

  return (
    <Inline justify="between" align="center" width="full">
      <BrandMark />
      <LanguageSwitcher
        ariaLabel={tLanguage('label')}
        currentLocale={locale}
        href={languageHref}
        options={languageOptions}
        width="fit"
        side="bottom"
        align="end"
      />
    </Inline>
  )
}
