'use client'

import { cva } from 'class-variance-authority'
import { useTranslations } from 'next-intl'

import { StatusPill } from '@/components/ui/status-pill'
import type { Locale } from '@/i18n/locales'

import { TakeLanguageControl } from './take-language-control'

const takeLocaleBarVariants = cva(
  'ml-auto flex w-fit flex-row flex-wrap items-center gap-2',
)

type LanguageOption = {
  locale: Locale
  label: string
}

export type TakeLocaleBarProps = {
  ariaLabel: string
  currentLocale: Locale
  options: LanguageOption[]
  onSelectLocale: (locale: Locale) => void
  interviewLocale?: Locale
  resolvedLocale?: Locale
}

export function TakeLocaleBar({
  ariaLabel,
  currentLocale,
  options,
  onSelectLocale,
  interviewLocale,
  resolvedLocale,
}: TakeLocaleBarProps) {
  const tTake = useTranslations('takeFlow')
  const showInterviewBadge =
    interviewLocale !== undefined && interviewLocale !== currentLocale
  const showResolvedBadge =
    resolvedLocale !== undefined && resolvedLocale !== currentLocale

  return (
    <div className={takeLocaleBarVariants()}>
      <TakeLanguageControl
        ariaLabel={ariaLabel}
        currentLocale={currentLocale}
        options={options}
        onSelectLocale={onSelectLocale}
      />
      {showInterviewBadge ? (
        <StatusPill tone="neutral_meta" casing="chip" size="compact">
          {tTake('languageBadgeInterviewAs', {
            locale: interviewLocale.toUpperCase(),
          })}
        </StatusPill>
      ) : null}
      {showResolvedBadge ? (
        <StatusPill tone="neutral_meta" casing="chip" size="compact">
          {tTake('languageBadgeResolvedAs', {
            locale: resolvedLocale.toUpperCase(),
          })}
        </StatusPill>
      ) : null}
    </div>
  )
}
