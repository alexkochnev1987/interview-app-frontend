import { useLocale, useTranslations } from 'next-intl'

import { LOCALE_FORMATS, type Locale } from './locales'

const DISPLAY_TIME_ZONE = 'UTC'

function localeFormat(locale: string) {
  return LOCALE_FORMATS[locale as Locale] ?? LOCALE_FORMATS.en
}

export function useInterviewFormatters() {
  const locale = useLocale()
  const t = useTranslations('dashboard.recent')
  const dateFormatter = new Intl.DateTimeFormat(localeFormat(locale), {
    timeZone: DISPLAY_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const dateTimeFormatter = new Intl.DateTimeFormat(localeFormat(locale), {
    timeZone: DISPLAY_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

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
