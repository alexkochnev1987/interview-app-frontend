import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import type { Locale } from '@/i18n/locales'
import { localizedPath } from '@/i18n/pathname'

import type { MeResponse } from './api'
import { ApiError } from './api-error'
import { isUnauthorizedError } from './api-error'
import { fetchCachedServerAuthMe } from './auth-server'
import { loginReturnPath } from './safe-redirect-path'
import { getServerRequestContext, type ServerRequestContext } from './server-fetch'

export type AuthGate =
  | { kind: 'authorized'; ctx: ServerRequestContext; me: MeResponse }
  | { kind: 'unauthenticated' }
  | { kind: 'forbidden' }
  | { kind: 'error'; message: string }

function loginRedirectUrl(returnPath: string, locale: Locale): string {
  const from = loginReturnPath(returnPath)
  const loginPath = localizedPath('/login', locale)
  return from ? `${loginPath}?from=${encodeURIComponent(localizedPath(from, locale))}` : loginPath
}

export function redirectIfUnauthenticated(
  auth: AuthGate,
  returnPath: string,
  locale: Locale,
): asserts auth is Exclude<AuthGate, { kind: 'unauthenticated' }> {
  if (auth.kind === 'unauthenticated') {
    redirect(loginRedirectUrl(returnPath, locale))
  }
}

export function redirectIfUnauthorizedError(
  err: unknown,
  returnPath: string,
  locale: Locale,
): void {
  if (isUnauthorizedError(err)) {
    redirect(loginRedirectUrl(returnPath, locale))
  }
}

export async function loadAuthGate(
  roleCheck: (role: string) => boolean,
  locale: Locale,
): Promise<AuthGate> {
  const ctx = await getServerRequestContext(locale)
  const t = await getTranslations({ locale, namespace: 'common' })

  if (!ctx.cookieHeader) {
    return { kind: 'unauthenticated' }
  }

  try {
    const me = await fetchCachedServerAuthMe(ctx.cookieHeader, ctx.origin)
    if (!me) {
      return { kind: 'unauthenticated' }
    }
    if (!roleCheck(me.role)) {
      return { kind: 'forbidden' }
    }
    return { kind: 'authorized', ctx, me }
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return { kind: 'unauthenticated' }
      }
      if (err.status === 403) {
        return { kind: 'forbidden' }
      }
    }
    const message = err instanceof Error ? err.message : t('profileLoadFailed')
    return { kind: 'error', message }
  }
}

export type EnforcePageAuthOptions = {
  roleCheck: (role: string) => boolean
  locale: Locale
  returnPath: string
  gateNamespace?: string
  backHref?: string
  backLabel?: string
  backLabelKey?: string
  forbiddenTitle?: string
  forbiddenTitleKey?: string
  forbiddenDescription?: string
  forbiddenDescriptionKey?: string
  errorTitle?: string
  errorTitleKey?: string
  errorDescription?: string
  errorDescriptionKey?: string
}

export type EnforcePageAuthResult =
  | { authorized: true; ctx: ServerRequestContext; me: MeResponse }
  | { authorized: false; fallback: ReactNode }

function getTranslationString(t: (key: string) => string, key: string): string | undefined {
  if ('has' in t && typeof (t as { has: (k: string) => boolean }).has === 'function') {
    return (t as { has: (k: string) => boolean }).has(key) ? t(key) : undefined
  }
  try {
    const val = t(key)
    return typeof val === 'string' ? val : undefined
  } catch {
    return undefined
  }
}

export async function enforcePageAuth(
  options: EnforcePageAuthOptions,
): Promise<EnforcePageAuthResult> {
  const {
    roleCheck,
    locale,
    returnPath,
    gateNamespace,
    backHref = '/',
    backLabel,
    backLabelKey,
    forbiddenTitle,
    forbiddenTitleKey,
    forbiddenDescription,
    forbiddenDescriptionKey,
    errorTitle,
    errorTitleKey,
    errorDescription,
    errorDescriptionKey,
  } = options

  const auth = await loadAuthGate(roleCheck, locale)
  redirectIfUnauthenticated(auth, returnPath, locale)

  if (auth.kind === 'forbidden') {
    let title = forbiddenTitle
    let description = forbiddenDescription

    if (gateNamespace && (!title || !description)) {
      const tGate = await getTranslations({ locale, namespace: gateNamespace })
      if (!title) {
        title =
          (forbiddenTitleKey ? getTranslationString(tGate, forbiddenTitleKey) : undefined) ??
          getTranslationString(tGate, 'forbiddenTitle')
      }
      if (!description) {
        description =
          (forbiddenDescriptionKey
            ? getTranslationString(tGate, forbiddenDescriptionKey)
            : undefined) ??
          getTranslationString(tGate, 'forbiddenDescription') ??
          getTranslationString(tGate, 'forbiddenDesc')
      }
    }

    if (!title || !description) {
      const tCommon = await getTranslations({ locale, namespace: 'common' })
      title = title || tCommon('forbiddenTitle')
      description = description || tCommon('forbiddenDescription')
    }

    return {
      authorized: false,
      fallback: <ForbiddenAccessPage title={title} description={description} />,
    }
  }

  if (auth.kind === 'error') {
    const tCommon = await getTranslations({ locale, namespace: 'common' })
    let title = errorTitle
    if (!title && gateNamespace) {
      const tGate = await getTranslations({ locale, namespace: gateNamespace })
      title =
        (errorTitleKey ? getTranslationString(tGate, errorTitleKey) : undefined) ??
        getTranslationString(tGate, 'unavailableTitle') ??
        getTranslationString(tGate, 'title')
    }
    title = title || tCommon('profileLoadFailed')

    let description = errorDescription
    if (!description && errorDescriptionKey && gateNamespace) {
      const tGate = await getTranslations({ locale, namespace: gateNamespace })
      description = getTranslationString(tGate, errorDescriptionKey)
    }
    description = description || `${tCommon('sessionVerificationFailed')} ${auth.message}`

    let resolvedBackLabel = backLabel
    if (!resolvedBackLabel && gateNamespace) {
      const tGate = await getTranslations({ locale, namespace: gateNamespace })
      resolvedBackLabel =
        (backLabelKey ? getTranslationString(tGate, backLabelKey) : undefined) ??
        getTranslationString(tGate, 'signInActionLabel') ??
        getTranslationString(tGate, 'actionLabel')
    }
    if (!resolvedBackLabel && backLabelKey) {
      const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
      resolvedBackLabel = getTranslationString(tFallback, backLabelKey)
    }

    return {
      authorized: false,
      fallback: (
        <FlashErrorPageFallback
          title={title}
          description={description}
          backHref={backHref}
          backLabel={resolvedBackLabel}
        />
      ),
    }
  }

  if (auth.kind !== 'authorized') {
    const tCommon = await getTranslations({ locale, namespace: 'common' })
    return {
      authorized: false,
      fallback: (
        <FlashErrorPageFallback
          title={tCommon('profileLoadFailed')}
          description={tCommon('sessionVerificationFailed')}
          backHref={backHref}
        />
      ),
    }
  }

  return {
    authorized: true,
    ctx: auth.ctx,
    me: auth.me,
  }
}
