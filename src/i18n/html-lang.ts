import type { Locale } from './locales'

export function isCandidateFlowPath(pathnameWithoutLocale: string): boolean {
  return (
    pathnameWithoutLocale === '/take' ||
    pathnameWithoutLocale.startsWith('/take/') ||
    pathnameWithoutLocale === '/feedback' ||
    pathnameWithoutLocale.startsWith('/feedback/')
  )
}

export function resolveHtmlLang(
  locale: Locale,
  pathnameWithoutLocale: string,
): string {
  return isCandidateFlowPath(pathnameWithoutLocale) ? 'en' : locale
}
