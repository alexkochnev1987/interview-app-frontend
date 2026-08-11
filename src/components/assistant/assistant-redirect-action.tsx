'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import type { RecruiterAssistantRedirect } from '@/lib/api'

import { buildAssistantRedirectHref } from './build-assistant-redirect-href'

type AssistantRedirectActionProps = {
  redirect: RecruiterAssistantRedirect
}

export function AssistantRedirectAction({ redirect }: AssistantRedirectActionProps) {
  const t = useTranslations('assistant')

  return (
    <Button asChild size="sm" variant="outline">
      <UnstyledLink href={buildAssistantRedirectHref(redirect)}>
        {t('redirect.continue')}
      </UnstyledLink>
    </Button>
  )
}
