'use client'

import { CopyPlus, LayoutTemplate } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Link } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { type Interview } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { canConfigureInterview } from '@/lib/auth-roles'

// Duplicate / save-as-template actions for a past interview via the ?fromInterview= prefill.
export function InterviewReuseActions({ interview }: { interview: Interview }) {
  const t = useTranslations('templates.reuse')
  const { user } = useAuth()

  // The write capability gates visibility. Demo users still see the actions but
  // the guard disables them with the read-only hint, matching the templates list.
  if (!canConfigureInterview(user?.role)) {
    return null
  }
  if (!interview.questions || interview.questions.length === 0) {
    return null
  }

  return (
    <Inline gap={2} wrap="wrap" width="full" justify="end">
      <DemoWriteGuard>
        <Button asChild variant="outline">
          <Link href={routes.templates.newFromInterview(interview.id)}>
            <Icon size="md">
              <LayoutTemplate />
            </Icon>
            {t('saveAsTemplate')}
          </Link>
        </Button>
      </DemoWriteGuard>
      <DemoWriteGuard>
        <Button asChild variant="default">
          <Link href={routes.interviews.newFromInterview(interview.id)}>
            <Icon size="md">
              <CopyPlus />
            </Icon>
            {t('duplicate')}
          </Link>
        </Button>
      </DemoWriteGuard>
    </Inline>
  )
}
