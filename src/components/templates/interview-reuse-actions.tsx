'use client'

import { useTranslations } from 'next-intl'
import { CopyPlus, LayoutTemplate } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Link } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { canConfigureInterview } from '@/lib/auth-roles'
import { useAuth, useIsDemo } from '@/lib/auth-context'
import { type Interview } from '@/lib/api'

// Duplicate / save-as-template actions for a past interview via the ?fromInterview= prefill.
export function InterviewReuseActions({ interview }: { interview: Interview }) {
  const t = useTranslations('templates.reuse')
  const { user } = useAuth()
  const isDemo = useIsDemo()

  // Only the write capability gates this; demo and non-configuring roles do not see the actions.
  if (isDemo || !canConfigureInterview(user?.role)) {
    return null
  }
  if (!interview.questions || interview.questions.length === 0) {
    return null
  }

  return (
    <Inline gap={2} wrap="wrap" width="full" justify="end">
      <Button asChild variant="outline">
        <Link href={routes.templates.newFromInterview(interview.id)}>
          <Icon size="md"><LayoutTemplate /></Icon>
          {t('saveAsTemplate')}
        </Link>
      </Button>
      <Button asChild variant="default">
        <Link href={routes.interviews.newFromInterview(interview.id)}>
          <Icon size="md"><CopyPlus /></Icon>
          {t('duplicate')}
        </Link>
      </Button>
    </Inline>
  )
}
