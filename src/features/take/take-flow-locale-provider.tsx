'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { resolveHtmlLang } from '@/i18n/html-lang'
import { mergeLocaleModules } from '@/i18n/module-loader-core.mjs'
import { localizedPath, pathLocale } from '@/i18n/pathname'
import { LOCALES, type Locale } from '@/i18n/locales'
import { setClientApiLocale } from '@/lib/api'

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'
const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
const TAKE_FLOW_MESSAGE_MODULES = ['common', 'takeFlow', 'toast', 'apiErrors'] as const
const TAKE_FLOW_NAMESPACE_KEYS = [
  'metadata',
  'common',
  'languageSwitcher',
  'shared',
  'takeFlow',
  'toast',
] as const
const API_ERROR_KEY_PATTERN = /^[A-Z][A-Z0-9_]+$/

function finalizeTakeFlowMessages(merged: TakeFlowMessages): TakeFlowMessages {
  if ('apiErrors' in merged && merged.apiErrors && typeof merged.apiErrors === 'object') {
    return merged
  }

  const apiErrors: Record<string, string> = {}
  const result: TakeFlowMessages = {}

  for (const [key, value] of Object.entries(merged)) {
    if (API_ERROR_KEY_PATTERN.test(key) && typeof value === 'string') {
      apiErrors[key] = value
      continue
    }
    result[key] = value
  }

  if (Object.keys(apiErrors).length > 0) {
    result.apiErrors = apiErrors
  }

  return result
}

type TakeFlowMessages = Record<string, unknown>

const takeFlowMessagesCache = new Map<Locale, TakeFlowMessages>()
const takeFlowMessagesInflight = new Map<Locale, Promise<TakeFlowMessages>>()

function pickTakeFlowMessages(fullMessages: TakeFlowMessages): TakeFlowMessages {
  const picked: TakeFlowMessages = {}
  for (const key of TAKE_FLOW_NAMESPACE_KEYS) {
    if (key in fullMessages) {
      picked[key] = fullMessages[key]
    }
  }

  for (const [key, value] of Object.entries(fullMessages)) {
    if (API_ERROR_KEY_PATTERN.test(key) && typeof value === 'string') {
      picked[key] = value
    }
  }

  return finalizeTakeFlowMessages(picked)
}

function isCompleteTakeFlowMessages(messages: TakeFlowMessages): boolean {
  return 'takeFlow' in messages && 'toast' in messages && 'apiErrors' in messages
}

async function loadTakeFlowLocaleMessages(locale: Locale): Promise<TakeFlowMessages> {
  const cached = takeFlowMessagesCache.get(locale)
  if (cached && isCompleteTakeFlowMessages(cached)) {
    return cached
  }

  const inflight = takeFlowMessagesInflight.get(locale)
  if (inflight) {
    return inflight
  }

  const request = mergeLocaleModules({
    locale,
    moduleOrder: [...TAKE_FLOW_MESSAGE_MODULES],
    loadModule: async (moduleName: string) => {
      const mod = await import(`../../../messages/${locale}/${moduleName}.json`)
      return mod.default as Record<string, unknown>
    },
  }).then((messages) => {
    const takeFlowMessages = finalizeTakeFlowMessages(messages as TakeFlowMessages)
    takeFlowMessagesCache.set(locale, takeFlowMessages)
    takeFlowMessagesInflight.delete(locale)
    return takeFlowMessages
  })

  takeFlowMessagesInflight.set(locale, request)
  return request
}

function prefetchTakeFlowLocaleMessages() {
  for (const locale of LOCALES) {
    void loadTakeFlowLocaleMessages(locale)
  }
}

type TakeFlowLocaleContextValue = {
  locale: Locale
  switchLocale: (nextLocale: Locale) => void
}

const TakeFlowLocaleContext = createContext<TakeFlowLocaleContextValue | null>(null)

function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=${LOCALE_COOKIE_MAX_AGE_SECONDS};samesite=lax`
}

function replaceTakeFlowUrlLocale(nextLocale: Locale, searchQuery: string) {
  const { pathnameWithoutLocale } = pathLocale(window.location.pathname)
  const pathWithQuery = searchQuery
    ? `${pathnameWithoutLocale}?${searchQuery}`
    : pathnameWithoutLocale
  const nextUrl = localizedPath(pathWithQuery, nextLocale)
  window.history.replaceState(window.history.state, '', nextUrl)
  document.documentElement.lang = resolveHtmlLang(nextLocale)
}

type TakeFlowLocaleProviderProps = {
  children: ReactNode
}

function TakeFlowLocaleProviderInner({ children }: TakeFlowLocaleProviderProps) {
  const parentLocale = useLocale() as Locale
  const parentMessages = useMessages()
  const searchParams = useSearchParams()

  const [locale, setLocale] = useState<Locale>(parentLocale)
  const [messages, setMessages] = useState(parentMessages)
  const localeSwitchGenerationRef = useRef(0)

  useEffect(() => {
    const seeded = pickTakeFlowMessages(parentMessages as TakeFlowMessages)
    if (isCompleteTakeFlowMessages(seeded)) {
      takeFlowMessagesCache.set(parentLocale, seeded)
    }
    prefetchTakeFlowLocaleMessages()
  }, [parentLocale, parentMessages])

  useEffect(() => {
    setClientApiLocale(locale)
    document.documentElement.lang = resolveHtmlLang(locale)
  }, [locale])

  const applyLocaleSwitch = useCallback(
    (nextLocale: Locale, nextMessages: TakeFlowMessages) => {
      setLocale(nextLocale)
      setMessages(nextMessages)
      writeLocaleCookie(nextLocale)
      setClientApiLocale(nextLocale)
      replaceTakeFlowUrlLocale(nextLocale, searchParams.toString())
    },
    [searchParams],
  )

  const switchLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale || !LOCALES.includes(nextLocale)) {
        return
      }

      const generation = ++localeSwitchGenerationRef.current

      const cachedMessages = takeFlowMessagesCache.get(nextLocale)
      if (cachedMessages && isCompleteTakeFlowMessages(cachedMessages)) {
        if (generation !== localeSwitchGenerationRef.current) {
          return
        }
        applyLocaleSwitch(nextLocale, cachedMessages)
        return
      }

      void loadTakeFlowLocaleMessages(nextLocale).then((nextMessages) => {
        if (generation !== localeSwitchGenerationRef.current) {
          return
        }
        applyLocaleSwitch(nextLocale, nextMessages)
      })
    },
    [applyLocaleSwitch, locale],
  )

  const contextValue = useMemo(
    () => ({
      locale,
      switchLocale,
    }),
    [locale, switchLocale],
  )

  return (
    <TakeFlowLocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </TakeFlowLocaleContext.Provider>
  )
}

export function TakeFlowLocaleProvider({ children }: TakeFlowLocaleProviderProps) {
  return <TakeFlowLocaleProviderInner>{children}</TakeFlowLocaleProviderInner>
}

export function useTakeFlowLocale() {
  const context = useContext(TakeFlowLocaleContext)
  if (!context) {
    throw new Error('useTakeFlowLocale must be used within TakeFlowLocaleProvider')
  }
  return context
}
