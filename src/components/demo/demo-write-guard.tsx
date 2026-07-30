'use client'

import { useTranslations } from 'next-intl'
import { cloneElement, type ReactElement } from 'react'

import { DisabledHintTooltip } from '@/components/ui/disabled-hint-tooltip'
import { useIsDemo } from '@/lib/auth-context'

export function DemoWriteGuard({
  width,
  disabled,
  children,
}: {
  width?: 'auto' | 'full'
  disabled?: boolean
  children: ReactElement<{ disabled?: boolean }>
}) {
  const isDemo = useIsDemo()
  const t = useTranslations('common')

  const guarded = cloneElement(children, {
    disabled: disabled || isDemo || children.props.disabled,
  })

  return (
    <DisabledHintTooltip active={isDemo} hint={t('demoMode.readOnlyHint')} width={width}>
      {guarded}
    </DisabledHintTooltip>
  )
}
