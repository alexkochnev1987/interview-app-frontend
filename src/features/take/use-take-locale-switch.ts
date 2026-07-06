'use client'

import { useTranslations } from 'next-intl'

import { LOCALES, type Locale } from '@/i18n/locales'

import { useTakeFlowLocale } from './take-flow-locale-provider'

export function useTakeLocaleSwitch() {
  const { locale, switchLocale } = useTakeFlowLocale()
  const tLanguage = useTranslations('languageSwitcher')

  const languageOptions = LOCALES.map((optionLocale) => ({
    locale: optionLocale,
    label: tLanguage(`locales.${optionLocale}`),
  }))

  return {
    locale,
    switchLocale,
    languageOptions,
    languageAriaLabel: tLanguage('label'),
  }
}
