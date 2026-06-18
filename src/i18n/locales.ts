export const LOCALES = ['en', 'be', 'ru', 'pl'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_FORMATS: Record<Locale, string> = {
  en: 'en-US',
  be: 'be-BY',
  ru: 'ru-RU',
  pl: 'pl-PL',
}
