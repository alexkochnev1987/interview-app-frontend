import type { Locale } from '@/i18n/locales'

const DRIVER_PROGRESS_TEMPLATES: Record<Locale, string> = {
  en: '{{current}} of {{total}}',
  be: '{{current}} з {{total}}',
  ru: '{{current}} из {{total}}',
  pl: '{{current}} z {{total}}',
}

export function getDriverProgressTemplate(locale: Locale): string {
  return DRIVER_PROGRESS_TEMPLATES[locale] ?? DRIVER_PROGRESS_TEMPLATES.en
}
