'use client'

import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { resolveHtmlLang } from '@/i18n/html-lang'
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales'
import { mergeLocaleModules } from '@/i18n/module-loader-core.mjs'
import { localizedPath, pathLocale } from '@/i18n/pathname'
import { setClientApiLocale } from '@/lib/api'

const TAKE_FLOW_MESSAGE_MODULES = ['common', 'takeFlow', 'toast', 'apiErrors'] as const
const TAKE_FLOW_NAMESPACE_KEYS = ['metadata', 'common', 'shared', 'takeFlow', 'toast'] as const
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

export function resolveTakeInterviewLocale(locale?: string | null): Locale {
  if (locale && (LOCALES as readonly string[]).includes(locale)) {
    return locale as Locale
  }
  return DEFAULT_LOCALE
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
  /**
   * HR-selected interview language once known.
   * `null`/`undefined` keeps the current route locale and does not rewrite the URL
   * (token entry loads interviewLocale asynchronously).
   */
  interviewLocale?: Locale | null
}

function TakeFlowLocaleProviderInner({
  children,
  interviewLocale,
}: {
  children: ReactNode
  interviewLocale: Locale | null
}) {
  const parentLocale = useLocale() as Locale
  const parentMessages = useMessages()
  const searchParams = useSearchParams()
  const effectiveLocale = interviewLocale ?? parentLocale
  const localeLocked = interviewLocale !== null

  const [locale, setLocale] = useState<Locale>(effectiveLocale)
  const [messages, setMessages] = useState(parentMessages)
  const localeApplyGenerationRef = useRef(0)

  useEffect(() => {
    if (effectiveLocale === parentLocale) {
      const seeded = pickTakeFlowMessages(parentMessages as TakeFlowMessages)
      if (isCompleteTakeFlowMessages(seeded)) {
        takeFlowMessagesCache.set(parentLocale, seeded)
      }
    }
  }, [effectiveLocale, parentLocale, parentMessages])

  useEffect(() => {
    const generation = ++localeApplyGenerationRef.current
    const searchQuery = searchParams.toString()

    const applyLocale = (nextMessages: TakeFlowMessages) => {
      if (generation !== localeApplyGenerationRef.current) {
        return
      }
      setLocale(effectiveLocale)
      setMessages(nextMessages)
      setClientApiLocale(effectiveLocale)
      if (localeLocked) {
        replaceTakeFlowUrlLocale(effectiveLocale, searchQuery)
      } else {
        document.documentElement.lang = resolveHtmlLang(effectiveLocale)
      }
    }

    const cachedMessages = takeFlowMessagesCache.get(effectiveLocale)
    if (cachedMessages && isCompleteTakeFlowMessages(cachedMessages)) {
      applyLocale(cachedMessages)
      return
    }

    if (effectiveLocale === parentLocale) {
      const seeded = pickTakeFlowMessages(parentMessages as TakeFlowMessages)
      if (isCompleteTakeFlowMessages(seeded)) {
        takeFlowMessagesCache.set(effectiveLocale, seeded)
        applyLocale(seeded)
        return
      }
    }

    // eslint-disable-next-line promise/always-return
    void loadTakeFlowLocaleMessages(effectiveLocale).then((nextMessages) => {
      applyLocale(nextMessages)
    })
  }, [effectiveLocale, localeLocked, parentLocale, parentMessages, searchParams])

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

export function TakeFlowLocaleProvider({
  children,
  interviewLocale,
}: TakeFlowLocaleProviderProps) {
  const lockedLocale =
    interviewLocale == null ? null : resolveTakeInterviewLocale(interviewLocale)

  return (
    <TakeFlowLocaleProviderInner interviewLocale={lockedLocale}>
      {children}
    </TakeFlowLocaleProviderInner>
  )
}
