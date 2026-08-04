'use client'

import { Monitor, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { AiAssistantChat } from '@/components/assistant/ai-assistant-chat'
import { ASSISTANT_CHAT_WIDGET_TITLE_ID } from '@/components/assistant/assistant-api-contract'
import {
  useAssistantChatSession,
  useAssistantChatShell,
} from '@/components/assistant/assistant-chat-provider'
import { Button } from '@/components/ui/button'
import {
  ChatWidgetBackdrop,
  ChatWidgetHeader,
  ChatWidgetShell,
  ChatWidgetTitle,
} from '@/components/ui/chat'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'

const CHAT_WIDGET_CLOSE_MS = 200

export function AssistantChatWidget() {
  const { open, closeAndRestoreFocus } = useAssistantChatShell()
  const { pendingAction } = useAssistantChatSession()
  const t = useTranslations('assistant')
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setClosing(false)
      return
    }

    if (!mounted) return

    setClosing(true)
    const timer = window.setTimeout(() => {
      setMounted(false)
      setClosing(false)
    }, CHAT_WIDGET_CLOSE_MS)

    return () => window.clearTimeout(timer)
  }, [open, mounted])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (pendingAction) return
      event.preventDefault()
      closeAndRestoreFocus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeAndRestoreFocus, open, pendingAction])

  if (!mounted) return null

  return (
    <>
      <ChatWidgetBackdrop closing={closing} />
      <ChatWidgetShell
        closing={closing}
        titleId={ASSISTANT_CHAT_WIDGET_TITLE_ID}
        trapped={open && !pendingAction}
      >
        <Stack gap={0} grow="fill" height="full">
          <ChatWidgetHeader>
            <Inline justify="between" align="center">
              <ChatWidgetTitle
                titleId={ASSISTANT_CHAT_WIDGET_TITLE_ID}
                name={t('name')}
                status={t('status.online')}
                icon={
                  <Icon size="lg" tone="primary">
                    <Monitor strokeWidth={2.25} />
                  </Icon>
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={closeAndRestoreFocus}
                aria-label={t('closeAriaLabel')}
              >
                <X />
              </Button>
            </Inline>
          </ChatWidgetHeader>
          <AiAssistantChat />
        </Stack>
      </ChatWidgetShell>
    </>
  )
}
