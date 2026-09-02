import type { Locale } from './locales'

export function isCandidateFlowPath(pathnameWithoutLocale: string): boolean {
  return (
    pathnameWithoutLocale === '/take' ||
    pathnameWithoutLocale.startsWith('/take/') ||
    pathnameWithoutLocale === '/feedback' ||
    pathnameWithoutLocale.startsWith('/feedback/') ||
    pathnameWithoutLocale === '/practice' ||
    pathnameWithoutLocale.startsWith('/practice/')
  )
}

export function resolveHtmlLang(locale: Locale): string {
  return locale
}
