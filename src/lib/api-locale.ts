import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales'

export type ApiLocale = Locale

export function resolveApiLocale(locale?: string | null): ApiLocale {
  if (!locale) return DEFAULT_LOCALE
  return LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE
}

export function buildApiLocaleHeaders(
  locale?: string | null,
  headers?: HeadersInit,
): Headers {
  const merged = new Headers(headers)
  merged.set('X-Locale', resolveApiLocale(locale))
  return merged
}
