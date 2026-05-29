import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales'
import { normalizePathname } from './pathname-normalize'

function splitPath(path: string): { pathname: string; suffix: string } {
  const suffixIndex = path.search(/[?#]/)
  if (suffixIndex === -1) {
    return { pathname: path, suffix: '' }
  }

  return {
    pathname: path.slice(0, suffixIndex),
    suffix: path.slice(suffixIndex),
  }
}

export function hasLocalePrefix(pathname: string) {
  const normalized = normalizePathname(pathname)
  const [, segment] = normalized.split('/')
  return LOCALES.includes(segment as Locale)
}

export function pathLocale(pathname: string): {
  locale: Locale
  pathnameWithoutLocale: string
} {
  const normalized = normalizePathname(pathname)
  const [, segment] = normalized.split('/')
  const prefixed = LOCALES.includes(segment as Locale)
  const locale = prefixed ? (segment as Locale) : DEFAULT_LOCALE
  const pathnameWithoutLocale = prefixed
    ? normalized.slice(segment.length + 1) || '/'
    : normalized

  return { locale, pathnameWithoutLocale }
}

export function stripLocalePrefix(path: string) {
  const { pathname, suffix } = splitPath(path)
  if (!hasLocalePrefix(pathname)) {
    return path
  }

  const [, segment] = pathname.split('/')
  return `${pathname.slice(segment.length + 1) || '/'}${suffix}`
}

export function localizedPath(path: string, locale: Locale) {
  const { pathname, suffix } = splitPath(stripLocalePrefix(path))
  if (locale === DEFAULT_LOCALE) {
    return `${pathname}${suffix}`
  }

  return `${pathname === '/' ? `/${locale}` : `/${locale}${pathname}`}${suffix}`
}
