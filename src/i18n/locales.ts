export const LOCALES = ['en', 'be', 'ru', 'pl'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export function resolveInterviewLocale(locale?: string | null): Locale {
  if (locale && (LOCALES as readonly string[]).includes(locale)) {
    return locale as Locale
  }
  return DEFAULT_LOCALE
}

export const resolveTakeInterviewLocale = resolveInterviewLocale
