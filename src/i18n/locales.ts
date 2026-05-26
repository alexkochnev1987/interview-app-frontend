export const LOCALES = ['en', 'be', 'ru', 'pl'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  be: 'Беларуская',
  ru: 'Русский',
  pl: 'Polski',
}
