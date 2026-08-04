'use client'

import { Bot } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { FloatingActionAnchor } from '@/components/ui/floating-action-anchor'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePathname } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth-context'
import { canUseAiAssistant } from '@/lib/auth-roles'

import { ASSISTANT_CHAT_LAUNCHER_ID } from './assistant-api-contract'
import { useAssistantChatShell } from './assistant-chat-provider'

function isAssistantLauncherPath(pathname: string): boolean {
  return pathname !== '/login'
}

export function AssistantChatLauncher() {
  const { user } = useAuth()
  const pathname = usePathname()
  const { toggle, open } = useAssistantChatShell()
  const t = useTranslations('assistant')

  if (!user || !canUseAiAssistant(user.role) || !isAssistantLauncherPath(pathname)) {
    return null
  }

  if (open) return null

  return (
    <FloatingActionAnchor>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            id={ASSISTANT_CHAT_LAUNCHER_ID}
            type="button"
            variant="gradient"
            size="icon-2xl"
            aria-label={t('name')}
            onClick={toggle}
          >
            <Bot />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">{t('name')}</TooltipContent>
      </Tooltip>
    </FloatingActionAnchor>
  )
}
