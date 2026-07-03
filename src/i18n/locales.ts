export const LOCALES = ['en', 'be', 'ru', 'pl'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_FORMATS: Record<Locale, string> = {
  en: 'en-US',
  be: 'be-BY',
  ru: 'ru-RU',
  pl: 'pl-PL',
}

export function resolveSpeechSynthesisLocale(locale: Locale): string {
  // Belarusian: most browsers lack be-BY voices; ru-RU is the closest available fallback.
  if (locale === 'be') {
    return LOCALE_FORMATS.ru
  }
  return LOCALE_FORMATS[locale]
}
