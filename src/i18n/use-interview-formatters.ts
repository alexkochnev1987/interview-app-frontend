import { useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { LOCALE_FORMATS, type Locale } from './locales'

const DISPLAY_TIME_ZONE = 'UTC'

function localeFormat(locale: string) {
  return LOCALE_FORMATS[locale as Locale] ?? LOCALE_FORMATS.en
}

export function useInterviewFormatters() {
  const locale = useLocale()
  const t = useTranslations('dashboard.recent')
  const formatLocale = localeFormat(locale)
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(formatLocale, {
        timeZone: DISPLAY_TIME_ZONE,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [formatLocale],
  )
  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(formatLocale, {
        timeZone: DISPLAY_TIME_ZONE,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    [formatLocale],
  )

  return {
    date(iso: string) {
      return dateFormatter.format(new Date(iso))
    },
    dateTime(iso: string) {
      return dateTimeFormatter.format(new Date(iso))
    },
    updated(iso: string) {
      return t('updated', { date: dateFormatter.format(new Date(iso)) })
    },
  }
}
