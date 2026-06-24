'use client'

import type { ReactNode } from 'react'

import { useTranslations } from 'next-intl'
import { StatusPill } from '@/components/ui/status-pill'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import type { Locale } from '@/i18n/locales'

type LanguageOption = {
  locale: Locale
  label: string
}

type TakeFlowChromeProps = {
  children: ReactNode
  currentLocale: Locale
  languageAriaLabel: string
  languageOptions: LanguageOption[]
  onSelectLocale: (locale: Locale) => void
  interviewLocale?: Locale
  fallbackFromLocale?: Locale
}

export function TakeFlowChrome({
  children,
  currentLocale,
  languageAriaLabel,
  languageOptions,
  onSelectLocale,
  interviewLocale,
  fallbackFromLocale,
}: TakeFlowChromeProps) {
  const tTake = useTranslations('takeFlow')
  const fallbackLocaleCode = fallbackFromLocale?.toUpperCase()
  const showInterviewLocaleBadge =
    interviewLocale !== undefined && interviewLocale !== currentLocale

  return (
    <Stack gap={4} width="full" grow="fill">
      <Inline justify="end" width="full" gap={2} align="center" wrap="wrap">
        <LanguageSwitcher
          ariaLabel={languageAriaLabel}
          currentLocale={currentLocale}
          options={languageOptions}
          onSelectLocale={onSelectLocale}
        />
        {showInterviewLocaleBadge ? (
          <StatusPill tone="neutral_meta" casing="chip" size="compact">
            {tTake('languageBadgeInterviewAs', {
              locale: interviewLocale.toUpperCase(),
            })}
          </StatusPill>
        ) : null}
        {fallbackLocaleCode ? (
          <StatusPill tone="neutral_meta" casing="chip" size="compact">
            {tTake('languageBadgeFallbackFrom', {
              locale: fallbackLocaleCode,
            })}
          </StatusPill>
        ) : null}
      </Inline>
      {children}
    </Stack>
  )
}
