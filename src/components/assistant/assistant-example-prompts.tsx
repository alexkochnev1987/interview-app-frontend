'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { useIsDemo } from '@/lib/auth-context'

import type { AssistantWelcomeRole } from './assistant-i18n'
import { getAssistantPromptKeys, getAssistantPromptMessageKey } from './assistant-prompts'

type AssistantExamplePromptsProps = {
  welcomeRole: AssistantWelcomeRole
  disabled?: boolean
  onSelect: (text: string) => void
}

export function AssistantExamplePrompts({
  welcomeRole,
  disabled = false,
  onSelect,
}: AssistantExamplePromptsProps) {
  const isDemo = useIsDemo()
  const t = useTranslations('assistant')
  const promptKeys = getAssistantPromptKeys(welcomeRole, { excludeWrite: isDemo })

  return (
    <Inline gap={2} wrap="wrap">
      {promptKeys.map((promptKey) => {
        const messageKey = getAssistantPromptMessageKey(welcomeRole, promptKey)

        return (
          <Button
            key={promptKey}
            type="button"
            variant="outline-pill"
            size="sm"
            disabled={disabled}
            onClick={() => onSelect(t(messageKey))}
          >
            {t(messageKey)}
          </Button>
        )
      })}
    </Inline>
  )
}
